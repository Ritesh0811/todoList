//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));


mongoose.connect("mongodb+srv://admin-ritesh:Test123@cluster0-nr0bd.mongodb.net/todolistDB",{useNewUrlParser:true});

const itemsSchema = {

  name:String

};

const Item = mongoose.model("item",itemsSchema);

const item1= new Item({

  name:"Welcome to to-do list"
});
const item2= new Item({

  name:"Hit + button to add a new item"
});
const item3= new Item({

  name:"<-- Hit this to delete an item"
});

const defaultItems =[item1, item2, item3];


const listSchema = {

  name:String,
  items:[itemsSchema]

};


const List = mongoose.model("List", listSchema);


Item.insertMany(defaultItems, function(err){
if (err) {
  console.log(err);
}else {
  console.log("Successfully saved default item to DB");
}
});


app.get("/", function(req, res) {


  Item.find({}, function(err, foundItems){
    if (foundItems.length ===0) {
      Item.insertMany(defaultItems, function(err){
      if (err) {
        console.log(err);
      }else {
        console.log("Successfully saved default item to DB");
      }
      });
      res.redirect("/");
    }else {
      res.render("list", {listTitle: "Today", newListItems: foundItems});
    }
  })

});



app.get("/:customListName", function(req,res){

  const customListName = req.params.customListName;

  List.findOne({name:customListName},function(err,foundList){

      if (!err) {
        if(!foundList){
          //create new listTitle
            const list = new List({

              name:customListName,
              items:defaultItems

            })

            list.save();
            res.redirect("/"+customListName)

        }else {
          // show existing list

          res.render("list",{listTitle:foundList.name, newListItems: foundList.items})
        }
      }

  })


})


app.post("/", function(req, res){

  const itemName =req.body.newItem;
  const listName = req.body.list;


  const item = new Item({
    name:itemName
    })

    if(listName==="Today"){

      item.save();
      res.render("/");
    }else {
      List.findOne({name:listName},function(err,foundList){
        foundList.items.push(item);
        foundList.save();
        res.redirect("/"+listName);
      })
    }
});


app.post("/delete",function(req,res){

    const checkedItemId = req.body.checkbox ;

    const listName = req.body.ListName;

    if (listName ==="Today"){

      Item.findByIdAndRemove(checkedItemId, function(err){

        if(!err){
            console.log("Successfully deleted checked Item");
            res.redirect("/");
        }
      });
    }else {
      List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemId}}},function(err,foundList){

          res.redirect("/"+listName);

      });
    }

});

app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});


let port = process.env.PORT;
if(port == null|| port == ""){

  port = 3000;

}


app.listen(port, function() {
  console.log("Server started on port 3000");
});
