import express from 'express'
const app = express();
const PORT = process.env.PORT || 5000


app.get('/',(req,res)=>{
  res.send('demo test')
})
app.listen(PORT, () => {
  console.log(`Server is running securely on port ${PORT}`);
});