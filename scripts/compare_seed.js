const fs = require('fs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function parseCopyStatement(sqlText) {
    const lines = sqlText.split('\n');
    let insideCopy = false;
    const records = [];
    let columns = [];
    
    for (let line of lines) {
        if (line.startsWith('COPY ')) {
            insideCopy = true;
            // COPY public."User" (id, email, name...) FROM stdin;
            const colMatch = line.match(/\((.*?)\)/);
            if (colMatch) {
                columns = colMatch[1].split(',').map(s => s.trim().replace(/"/g, ''));
            }
            continue;
        }
        if (insideCopy && line === '\\.') {
            insideCopy = false;
            continue;
        }
        if (insideCopy) {
            const values = line.split('\t');
            const record = {};
            columns.forEach((col, idx) => {
                record[col] = values[idx] === '\\N' ? null : values[idx];
            });
            records.push(record);
        }
    }
    return records;
}

async function run() {
    console.log("=== COMPARING TABLES ===");

    // 1. User
    const backupUsers = parseCopyStatement(fs.readFileSync('C:/tmp/dump_User.sql', 'utf8'));
    const currentUsers = await prisma.user.findMany();
    
    // Find diffs for admin
    const backupAdmin = backupUsers.find(u => u.email === 'admin@naht-re.sa');
    const currentAdmin = currentUsers.find(u => u.email === 'admin@naht-re.sa');
    
    if (backupAdmin && currentAdmin) {
        const dBackup = new Date(backupAdmin.updatedAt).getTime();
        const dCurrent = new Date(currentAdmin.updatedAt).getTime();
        console.log(`User (Admin) updatedAt changed: ${dBackup !== dCurrent} (Backup: ${backupAdmin.updatedAt}, Current: ${currentAdmin.updatedAt})`);
    }

    // 2. HomePageContent
    const backupHP = parseCopyStatement(fs.readFileSync('C:/tmp/dump_HomePageContent.sql', 'utf8'));
    const currentHP = await prisma.homePageContent.findMany();
    
    if (backupHP.length > 0 && currentHP.length > 0) {
        const dBackup = new Date(backupHP[0].updatedAt).getTime();
        const dCurrent = new Date(currentHP[0].updatedAt).getTime();
        console.log(`HomePageContent updatedAt changed: ${dBackup !== dCurrent} (Backup: ${backupHP[0].updatedAt}, Current: ${currentHP[0].updatedAt})`);
        
        if (backupHP[0].heroTitle !== currentHP[0].heroTitle) {
            console.log(`HomePageContent heroTitle changed! Backup: ${backupHP[0].heroTitle}, Current: ${currentHP[0].heroTitle}`);
        }
    }
    
    // 3. Project
    const backupProjects = parseCopyStatement(fs.readFileSync('C:/tmp/dump_Project.sql', 'utf8'));
    const currentProjects = await prisma.project.findMany();
    
    const backupDemo = backupProjects.find(p => p.slug === 'naht-demo');
    const currentDemo = currentProjects.find(p => p.slug === 'naht-demo');
    if (backupDemo && currentDemo) {
        const dBackup = new Date(backupDemo.updatedAt).getTime();
        const dCurrent = new Date(currentDemo.updatedAt).getTime();
        console.log(`Project (naht-demo) updatedAt changed: ${dBackup !== dCurrent} (Backup: ${backupDemo.updatedAt}, Current: ${currentDemo.updatedAt})`);
    }

    await prisma.$disconnect();
}
run();
