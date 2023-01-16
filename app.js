const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const _ = require("lodash");
const app = express();

mongoose.set('strictQuery', false);
mongoose.connect("mongodb+srv://cluster0:matt@cluster0.aqcg8oz.mongodb.net/TodoListDB", {useNewUrlParser: true});
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('public'))
app.set('view engine', 'ejs');

// schema for a DB
const itemSchema = {
    name: String
};
const Item = mongoose.model("Item", itemSchema);

const item1 = new Item({
    name: 'Welcome to your Todo list'
})
const item2 = new Item({
    name: 'Hit the "+" to add a new task'
})
const item3 = new Item({
    name: 'Hit the delete button to delete a task'
})

const defultItems = [item1, item2, item3];

const listSchema = {
    name: String,
    items:[itemSchema]
}
const List = mongoose.model("List", listSchema);

// Create and save a custom list


app.get('/', function(req, res){
    Item.find({}, function(err, items){
    if(err){
        console.log(err)
    }
    else{
        if ((items.length === 0)){
            Item.insertMany(defultItems);
        }
        else{
            res.render('list', { listTitle: "Today", newtask: items });
        }
    }    
      
    });
});

app.post('/', function(req, res){
    const task = req.body.task;
    const listName = req.body.S_button;
    const item = new Item({
        name: task
    })
    if (listName === "Today"){
        item.save();
        res.redirect('/');
    } else{
        List.findOne({name: listName}, function(err, foundList){
            foundList.items.push(item);
            foundList.save();
            res.redirect("/" + listName);
        })
    }


})

// Delete an Entry    
app.post('/delete', function(req, res){
    const removeFrom = req.body.listName;
    const removeItem = req.body.checkbox
    if(removeFrom === "Today"){
        Item.deleteOne({name:req.body.checkbox}, function(err){
            if (err){
                console.log(err);
            }
            else{
                console.log("Succsessfuly updated the record");
                res.redirect('/');
            }
        })
    } else{
       List.findOneAndUpdate({name: removeFrom}, {$pull: {items: {name: removeItem}}}, function(err, foundList){
        if (!err){
            res.redirect("/" + removeFrom);
        }
       })
    }
})

// Custom Get Method
app.get('/:customListName', function(req, res){
    const customListName = _.capitalize(req.params.customListName);
    
    List.findOne({name: customListName}, function(err, foundList){
        if(!err){
            if(!foundList){
                // Create a new list
                const list = new List({
                name: customListName,
                items: defultItems
                })
                list.save();
                res.redirect('/' + customListName);
            } else{
                // Show existing list
                res.render('list', {listTitle: foundList.name, newtask: foundList.items})
            }
        }
    }) 

})



// app.get('/about', function(req, res){
//     res.render('about');
// })


app.listen(3005, function(){
    console.log("Server is up and running on port 3005");
    
})