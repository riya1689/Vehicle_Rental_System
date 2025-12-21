import app from './app'
import dotenv from 'dotenv'

dotenv.config();
const port = process.env.PORT || 5000;

if(require.main === module){
    app.listen(port, ()=>{
        console.log(`Vehicle Rental System running on port ${port}`);
    });
}

export default app;