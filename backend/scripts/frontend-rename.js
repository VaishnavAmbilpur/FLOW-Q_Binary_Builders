const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '../../frontend-next/src/app');

const renameTasks = [
    { oldPath: 'display/[hospitalId]', newPath: 'display/[organizationId]' },
    { oldPath: 'display/[organizationId]/[doctorId]', newPath: 'display/[organizationId]/[agentId]' },
    { oldPath: 'kiosk/[hospitalId]', newPath: 'kiosk/[organizationId]' },
    { oldPath: '(dashboard)/admin', newPath: '(dashboard)/org-admin' }
];

function executeRenames() {
    console.log("🚀 Starting Directory Renaming...");
    
    // Deleting the legacy doctor dashboard first
    const doctorDashboard = path.join(root, '(dashboard)/doctor');
    if (fs.existsSync(doctorDashboard)) {
        console.log(`🗑️ Deleting legacy dashboard: ${doctorDashboard}`);
        fs.rmSync(doctorDashboard, { recursive: true, force: true });
    }

    renameTasks.forEach(task => {
        const fullOldPath = path.join(root, task.oldPath);
        const fullNewPath = path.join(root, task.newPath);

        if (fs.existsSync(fullOldPath)) {
            console.log(`📂 Moving ${task.oldPath} -> ${task.newPath}`);
            // Ensure parent directory exists for newPath
            const parentDir = path.dirname(fullNewPath);
            if (!fs.existsSync(parentDir)) {
                fs.mkdirSync(parentDir, { recursive: true });
            }
            fs.renameSync(fullOldPath, fullNewPath);
        } else {
            console.log(`⚠️ Skip: ${task.oldPath} not found.`);
        }
    });

    console.log("✅ Renaming Complete.");
}

executeRenames();
