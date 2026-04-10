const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, '../../frontend-next/src');

const replacements = [
    { search: /Hospital/g, replace: 'Organization' },
    { search: /hospital/g, replace: 'organization' },
    { search: /Doctor/g, replace: 'Agent' },
    { search: /doctor/g, replace: 'agent' },
    { search: /Patient/g, replace: 'Customer' },
    { search: /patient/g, replace: 'customer' },
    { search: /Clinic/g, replace: 'Hub' },
    { search: /clinic/g, replace: 'hub' },
    { search: /Specialization/g, replace: 'Service Category' },
    { search: /specialization/g, replace: 'serviceCategory' },
    { search: /Clinical/g, replace: 'Business' },
    { search: /clinical/g, replace: 'business' },
    { search: /Consultation/g, replace: 'Session' },
    { search: /consultation/g, replace: 'session' },
    { search: /HIPAA/g, replace: 'GDPR' },
    { search: /avgConsultationTime/g, replace: 'avgSessionTime' },
    { search: /hospitalId/g, replace: 'organizationId' },
    { search: /doctorId/g, replace: 'agentId' },
    { search: /\/api\/hospitals/g, replace: '/api/organizations' },
    { search: /\/api\/doctors/g, replace: '/api/agents' },
    { search: /HOSPITAL_ADMIN/g, replace: 'ORG_ADMIN' }
];

function walk(dir) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
            walk(filePath);
        } else if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js') || file.endsWith('.css')) {
            let content = fs.readFileSync(filePath, 'utf8');
            let changed = false;
            
            replacements.forEach(r => {
                if (r.search.test(content)) {
                    content = content.replace(r.search, r.replace);
                    changed = true;
                }
            });

            if (changed) {
                fs.writeFileSync(filePath, content, 'utf8');
                console.log(`Updated: ${filePath}`);
            }
        }
    });
}

console.log("🚀 Starting Frontend Generalization Sweep...");
walk(targetDir);
console.log("✅ Sweep Complete.");
