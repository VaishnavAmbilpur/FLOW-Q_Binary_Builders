const Hospital = require("../models/Hospital");

/**
 * Middleware to conditionally mask PII data based on the organization's PII Mode setting.
 * If piiMode is false, patient names and phone numbers are masked in the outgoing response.
 */
const piiFilterMiddleware = async (req, res, next) => {
    // Intercept the response res.json
    const originalJson = res.json;

    res.json = function (data) {
        // We only process if we know the organizationId
        if (req.user && req.user.hospitalId) {
            try {
                // Skip masking for authorized staff roles
                const isStaff = ['HOSPITAL_ADMIN', 'DOCTOR', 'RECEPTIONIST'].includes(req.user.role);
                
                // Assuming piiMode is fetched and attached to req.hospital by an earlier middleware
                // If it's not present, we default to masking (false) UNLESS the user is staff.
                const piiMode = req.hospital && req.hospital.piiMode !== undefined ? req.hospital.piiMode : false;

                if (!isStaff && !piiMode && data) {
                    // Mask data recursively for others (e.g. patients or public views)
                    data = maskPii(data);
                }
            } catch (err) {
                console.error("PII Filter crashing during res.json interception:", err);
            }
        }

        // Call the original res.json
        return originalJson.call(this, data);
    };

    next();
};

function maskPii(obj) {
    if (!obj) return obj;

    if (Array.isArray(obj)) {
        return obj.map(item => maskPii(item));
    } else if (typeof obj === 'object') {
        // Handle MongoDB Documents or raw objects safely
        let newObj;
        try {
            if (obj.toJSON) {
                newObj = obj.toJSON();
            } else if (obj.toObject) {
                newObj = obj.toObject();
            } else {
                newObj = { ...obj };
                if (newObj._doc) {
                    Object.assign(newObj, newObj._doc);
                    delete newObj._doc;
                }
            }
        } catch (e) {
            newObj = { ...obj };
        }

        for (const key of Object.keys(newObj)) {
            if (key === 'name' && typeof newObj[key] === 'string') {
                newObj[key] = maskName(newObj[key]);
            } else if (key === 'number' && typeof newObj[key] === 'string') {
                newObj[key] = maskPhone(newObj[key]);
            } else if (newObj[key] && typeof newObj[key] === 'object' && !(newObj[key] instanceof Date)) {
                newObj[key] = maskPii(newObj[key]);
            }
        }
        return newObj;
    }
    return obj;
}

function maskName(name) {
    if (!name) return name;
    const parts = name.split(' ');
    return parts.map(p => {
        if (p.length <= 1) return p;
        return p[0] + '*'.repeat(p.length - 1);
    }).join(' ');
}

function maskPhone(phone) {
    if (!phone) return phone;
    if (phone.length < 4) return '*'.repeat(phone.length);
    return phone.slice(0, 2) + '*'.repeat(phone.length - 4) + phone.slice(-2);
}

module.exports = piiFilterMiddleware;
