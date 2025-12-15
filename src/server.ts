import app from './app'
import dotenv from 'dotenv'

dotenv.config();
const port = process.env.PORT || 5000;

async function main(){
    try{
        app.listen(port, () =>{
            console.log(`vehicle management system running on port ${port}`)
        });
    }catch(error){
        console.error(error);
    }
}


main();