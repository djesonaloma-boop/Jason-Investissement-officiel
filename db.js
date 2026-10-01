const fs = require('fs');
const path = require('path');
const DB_FILE = path.join(__dirname, '../../data/database.json');

if(!fs.existsSync(DB_FILE)){
  fs.writeFileSync(DB_FILE, JSON.stringify({
    users:[{id:'admin_001',name:'Admin Jason',phone:'+243999999999',email:'admin@jason.com',password:'$2a$10$...',solde:10000000,points:10000,referralCode:'JAS-ADMIN',role:'admin',createdAt:new Date().toISOString()}],
    investments:[], transactions:[], parrainages:[], tasks:[], vips:[]
  },null,2));
}
module.exports = {
  load:()=>JSON.parse(fs.readFileSync(DB_FILE,'utf8')),
  save:(db)=>fs.writeFileSync(DB_FILE, JSON.stringify(db,null,2))
};