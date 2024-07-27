const { faker } = require('@faker-js/faker');
const mysql = require('mysql2');
const express = require('express');
const app = express();
var methodOverride = require('method-override');
const path = require('path');
const { count, error } = require('console');
const { rmSync } = require('fs');
let port = 3000;

app.set("view engine","ejs");
app.set("views" , path.join(__dirname,"/views"));
app.use("public",express.static(path.join(__dirname,"/public")));
app.use(express.urlencoded({extended : true}));
app.use(methodOverride('_method'));



app.listen(port, ()=>{
  console.log("Your app is running");
})

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  database: 'delta_app',
  password: 'viky4752G@'
});

let randomUser = () => {
  return [
    faker.string.uuid(),
    faker.internet.userName(),
    faker.internet.email(),
    faker.internet.password(),
  ];
}

try{
  connection.query("TRUNCATE TABLE temp",(err,results)=>{
     if(err) throw err;
    //  console.log(results);
  });
}
catch(err){
  console.log(err);
}

let q = "INSERT INTO temp (id,name,email,password) VALUES ?";

let data = [];

for(let i = 0; i <100 ; i++){
  data.push(randomUser());
}



try{
  connection.query(q,[data],(err,results)=>{
      if(err) throw err;
      // console.log(results);
  });
}catch(err){
 console.log(err);
}



app.get("/",(req,res)=>{
   try{
    connection.query("SELECT count(*) FROM temp",(err,results)=>{
        if(err) throw err;
        // console.log(results);
        let count = results[0]['count(*)'];
        // console.log(count);
         res.render("home.ejs" , {count});
    });
  }catch(err){
   console.log(err);
   res.send("Some error in DB");
  }

});

app.get("/user",(req,res)=>{
  try{
    connection.query("SELECT * FROM temp",(err,results)=>{
        if(err) throw err;
        // console.log(results);
        let datas = results;
        // res.send(data);
         res.render("user.ejs" , {datas});
    });
  }catch(err){
   console.log(err);
   res.send("Some error in DB");
  }
})


app.get("/user/:id/edit",(req,res) => {
  try{
    let {id} = req.params;
    console.log(id);
    connection.query(`SELECT * FROM temp WHERE id = '${id}'`,(err,results)=>{
        if(err) throw err;
        let data = results[0];
        console.log(data);
        // res.send(data);
         res.render("edit.ejs" , {data});

    });
  }
  catch(err){
   console.log(err);
   res.send("Some error in DB");
  }
})

app.patch("/user/edit/:id" , (req,res) => {
  
  try{
    let {id} = req.params;
    let {name , password} = req.body;
    console.log(name +"\n"+ password + "\n");
    console.log(id);
    connection.query(`SELECT * FROM temp WHERE id = '${id}'`,(err,results)=>{
        if(err) throw err;
        // console.log(results);
        let data = results[0];
        if(data.password == password){
          try{
          connection.query(`UPDATE temp SET name = '${name}' WHERE id = '${id}' `,(err,results)=>{
            if(err) throw err;
            // console.log(results);
            let data = results;
            res.redirect("/user");
            // res.send("edit the user");
            //  res.render("edit.ejs" , {data});
            }); 
          }
          catch(err){
              console.log(err);
              res.send("Some error in DB");
             }
    
        };
     
    
      });
  }

  catch(err){
   console.log(err);
   res.send("Some error in DB");
  }
});

app.delete("/user/:id",(req,res)=>{
 let {id} = req.params;
 try{
   connection.query(`DELETE  FROM temp WHERE id = '${id}'`,(err,results)=>{
      if(err) throw err;
      // console.log(results);
      res.redirect("/user");
   });
}
catch(err){
  console.log(err);
}

})



app.get("/user/add",(req,res)=>{
  res.render("newuser.ejs");
})

app.post("/user/add",(req,res)=>{
  let{id,name,email,password} = req.body;
  try{
    connection.query(`SELECT count(*) FROM temp WHERE id = ${id}`,(err,results)=>{
      if(err) throw err;
      let count = results[0]['count(*)'];
      console.log(count);
      if(count == 0){
        try{
          connection.query(`INSERT INTO temp (id,name,email,password) VALUES ('${id}','${name}','${email}','${password}')`,(err,results)=>{
            if(err) throw err;
            res.redirect("/user");
            // console.log(results);
          });

        }
        catch{
          console.log(err);
        }
      }
    })
  }
  catch(err){
    console.log(err);
    res.send("Some error in db")
  }
});
  