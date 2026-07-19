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
                let val = values[idx] === '\\N' ? null : values[idx];
                if (typeof val === 'string' && val.endsWith('\r')) val = val.slice(0, -1);
                record[col] = val;
            });
            records.push(record);
        }
    }
    return records;
}

async function run() {
    const report = { tables: {}, violations: [] };

    const checkTable = async (tableName, pkCol, dumpFile, getDbRecords) => {
        const backupData = parseCopyStatement(fs.readFileSync(dumpFile, 'utf8'));
        const currentData = await getDbRecords();
        
        const backupMap = new Map(backupData.map(r => [r[pkCol], r]));
        const currentMap = new Map(currentData.map(r => [String(r[pkCol]), r]));
        
        let created = 0;
        let deleted = 0;
        let recreated = 0;
        let onlyUpdated = 0;
        let bizChanged = 0;
        
        const details = [];

        for (const [id, cRec] of currentMap.entries()) {
            if (!backupMap.has(id)) {
                created++;
            } else {
                const bRec = backupMap.get(id);
                let diffs = [];
                for (const key of Object.keys(cRec)) {
                    let cv = cRec[key];
                    let bv = bRec[key];
                    if (cv instanceof Date) cv = cv.toISOString();
                    if (bv !== null && bv !== undefined && (key === 'createdAt' || key === 'updatedAt')) {
                        // Compare dates roughly
                        if (new Date(cv).getTime() !== new Date(bv).getTime()) {
                            diffs.push(key);
                        }
                    } else {
                        // simple string comparison
                        if (String(cv) !== String(bv) && !(cv === null && bv === null)) {
                            diffs.push(key);
                        }
                    }
                }
                if (diffs.length > 0) {
                    const onlyTimestamps = diffs.every(k => k === 'createdAt' || k === 'updatedAt');
                    if (onlyTimestamps) {
                        onlyUpdated++;
                    } else {
                        bizChanged++;
                        details.push({ id, diffs });
                    }
                }
            }
        }
        for (const [id, bRec] of backupMap.entries()) {
            if (!currentMap.has(id)) {
                deleted++;
            }
        }

        report.tables[tableName] = { created, deleted, recreated, onlyUpdated, bizChanged, details };
    };

    // 1. User
    const backupUsers = parseCopyStatement(fs.readFileSync('C:/tmp/dump_User.sql', 'utf8'));
    const currentUsers = await prisma.user.findMany();
    
    const bAdmin = backupUsers.find(u => u.email === 'admin@naht-re.sa');
    const cAdmin = currentUsers.find(u => u.email === 'admin@naht-re.sa');
    
    if (bAdmin && cAdmin) {
        const passChanged = bAdmin.password !== cAdmin.password;
        if (passChanged) report.violations.push("Admin password hash changed!");
        report.adminUser = {
            passwordHashChanged: passChanged ? 'Yes' : 'No',
            name: { backup: bAdmin.name, current: cAdmin.name },
            role: { backup: bAdmin.role, current: cAdmin.role },
            departmentId: { backup: bAdmin.departmentId, current: cAdmin.departmentId }
        };
    }

    await checkTable('SiteSettings', 'id', 'C:/tmp/dump_SiteSettings.sql', () => prisma.siteSettings.findMany());
    await checkTable('HomePageContent', 'id', 'C:/tmp/dump_HomePageContent.sql', () => prisma.homePageContent.findMany());
    await checkTable('Project', 'id', 'C:/tmp/dump_Project.sql', () => prisma.project.findMany());
    await checkTable('ProjectFeature', 'id', 'C:/tmp/dump_ProjectFeature.sql', () => prisma.projectFeature.findMany().catch(()=>[]));
    await checkTable('ProjectWarranty', 'id', 'C:/tmp/dump_ProjectWarranty.sql', () => prisma.projectWarranty.findMany().catch(()=>[]));
    await checkTable('ProjectGalleryImage', 'id', 'C:/tmp/dump_ProjectGalleryImage.sql', () => prisma.projectGalleryImage.findMany().catch(()=>[]));
    await checkTable('Unit', 'id', 'C:/tmp/dump_Unit.sql', () => prisma.unit.findMany().catch(()=>[]));
    await checkTable('Faq', 'id', 'C:/tmp/dump_Faq.sql', () => prisma.faq.findMany().catch(()=>[]));
    await checkTable('Service', 'id', 'C:/tmp/dump_Service.sql', () => prisma.service.findMany().catch(()=>[]));
    
    // Lead
    await checkTable('Lead', 'id', 'C:/tmp/dump_Lead.sql', () => prisma.lead.findMany().catch(()=>[]));

    console.log(JSON.stringify(report, null, 2));
    await prisma.$disconnect();
}
run();
