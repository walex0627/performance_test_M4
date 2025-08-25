import { loadBills } from "./load.service.js";

(async ()=>{
    try{
        console.log('start seeders');
        // await loadClients()
        // await loadTransactions()
        await loadBills()
        console.log('all seeders executed correctly');
        
    }catch(error){
        console.error('error executed seeders:', error.message)
    }finally{
        process.exit()
    }
})()