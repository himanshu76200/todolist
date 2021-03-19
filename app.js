const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
const date = require(__dirname + "/date.js");

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

app.set("view engine", "ejs");

mongoose.connect("mongodb+srv://admin-himanshu:test123@cluster0.plpj6.mongodb.net/todolistDB", {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false});

const itemsSchema = {
  name: String
};

const Item = mongoose.model("item", itemsSchema);

const item1 = new Item({
  name: "welcome to todolist"
});

const item2 = new Item({
  name: "Hit + to add new item"
});

const item3 = new Item({
  name: "<-- Hit to delete an item"
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);

app.get("/", function(req, res) {
  let day = date.getDate();
  Item.find({}, function(err, foundItems) {

    if(foundItems.length === 0) {
      Item.insertMany(defaultItems, function(err) {
        if (err) {
          console.log(err);
        } else {
          console.log("successfully saved in databases");
        }
      })
      res.redirect("/");
    } else {
      res.render("list", {kindOfDay: day, newListItems: foundItems});
    }
  })

})

app.get("/:customListName", function(req, res){
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name: customListName}, function(err, foundList){
    if (!err) {
      if (!foundList) {

        const list = new List({
          name: customListName,
          items: defaultItems
        });

        list.save();
        res.redirect("/" + customListName);
      } else {
        res.render("list", {kindOfDay: foundList.name, newListItems: foundList.items});
      }
    }
  })


})

app.post("/", function(req, res) {

  let day = date.getDate();
  const itemName = req.body.newItem;
  const listName = req.body.list;

  // console.log(listName);

  const item = new Item({
    name: itemName
  });

  if(listName === day) {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({name: listName}, function(err, foundList) {
        foundList.items.push(item);
        foundList.save();
        res.redirect("/" + listName);
    })
  }



})

app.post("/delete", function(req, res) {
  let day = date.getDate();
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === day) {
    Item.findByIdAndRemove(checkedItemId, function(err) {
      if (err) {
          console.log(err);
        } else {
          console.log("Item with id " + checkedItemId + " deleted successfully");
          res.redirect("/");
        }
    });
  } else {
    List.findOneAndUpdate({name: listName},
      {$pull: {items: {_id: checkedItemId}}},
      function(err, foundList) {
        if(!err) {
          res.redirect("/" + listName);
        }
    })
  }

  // Item.deleteOne({_id: checkedItemId}, function(err) {
  //   if (err) {
  //     console.log(err);
  //   } else {
  //     console.log("Item with id " + checkedItemId + " deleted successfully");
  //     res.redirect("/");
  //   }
  // })

})

app.listen(3000, function(){
  console.log("app running on 3000");
})
