/*************************************PACKAGES ***************************** */
const express = require("express")
const bodyParser = require("body-parser")
const mongoose = require("mongoose")
const session = require("express-session")
const mongoDBsession = require("connect-mongodb-session")(session) // session object from express-session 
const multer = require('multer');




/**************************************CONNECTION AND SCHEMA ****************************** */
const app = express()

//- MONGODB CONNECTION
mongoose.connect('mongodb://localhost:27017/EventDB', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
})


//- CONSOLE PRINTING
mongoose.connection.on('connected', function () {
    console.log('Mongoose default connection open to ');
});
const Schema = mongoose.Schema

//- REGISTRATION SCHEMA
const regSchema = new Schema({
    type: {
        type: String,
        /* required: true, */
    },
    fname: {
        type: String,
        /*  required: true, */
    },
    lname: {
        type: String,
        /*  required: true, */
    },
    department: {
        type: Schema.Types.ObjectId,
        ref: 'Department',
    },
    date: {
        type: Date,
        default: () => Date.now(),
    },
    rid: {
        type: String,
        unique: true,
        /* required: true, */
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    hod: {
        type: Boolean,
        default: false,
    },
    img:
    {
        type: String,
        default: "user.png"

    },
    feed:
        [
            {
                type: Schema.Types.ObjectId,
                ref: 'Feed'
            }
        ],
    status: {
        type: Number,
        default: 0,
    }

});

const feedSchema = new Schema({
    author: {
        type: Schema.Types.ObjectId,
        ref: 'Register'
    },
    departmentName: {
        type: String,
        /* required: true */
    },
    title: {
        type: String,
        required: true
    },
    feed: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: () => Date.now(),
    },
    rid: {
        type: String
    },
    status: {
        type: Number, // -1 0 1
        default: 0
    },
    img:
    {
        type: String,
        /*   default : "arrow.png" */

    },
    princi:{
        type: Boolean
    },
    
    selected:{
        type: Number,
        default: 0000
    },

    participate: [{ type: Schema.Types.ObjectId, ref: 'Register' }],

});

const depSchema = new mongoose.Schema({
    department: {
        type: String,
        required: true,
    },
    hod: {
        type: Number,

    },
    students: [{ type: Schema.Types.ObjectId, ref: 'Register' }],
    teachers: [
        { type: Schema.Types.ObjectId, ref: 'Register' }
    ],
    feeds: [
        { type: Schema.Types.ObjectId, ref: 'Feed' }

    ],
    status: {
        type: Number,
    }

});





/* const notificationSchema = new Schema({
    rid :{
        type: String
    },
    pending :{
      type: String  
    },
    approved :{
        type: String
    },
    deleted :{
        type: String
    }

}) */

/* const pendSchema = new Schema({

    pending : {
        type : String
    },

    rid : {
        type : String
    }

})
 */





//- OBJECT OF regSchema

const Register = mongoose.model("Register", regSchema)
const Feed = mongoose.model("Feed", feedSchema)
const Department = mongoose.model("Department", depSchema)

/* const Noti = mongoose.model("Notification", notificationSchema) */





//- MONGOOSE SESSION
const mystore = new mongoDBsession({
    uri: "mongodb://localhost:27017/EventDB",
    collection: "mysession"
})


//- CHECKING SESSION
const isAuth = (req, res, next) => {
    if (req.session.isAuth)
        next()
    else
        res.render("HOME/index")
}



// IMAGE UPLOADING
var storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './public/uploads')
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now())
    }
});

var upload = multer({ storage: storage });

/**************************************MIDDLEWARES********************************** */
app.use(session({
    secret: "secret",
    resave: false,
    saveUninitialized: false,
    store: mystore
}))

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json())
app.use(express.static("public"));







/***************************************GET AND POST********************************** */
//-Home
app.get("/", (req, res) => {
    res.render("HOME/index")
})


//-Signin
app.get("/signin", (req, res) => {
    res.render("HOME/signin")
})

app.post("/signin", (req, res) => {



    Register.findOne({ email: req.body.email }, function (err, docs) {


        if (docs == null) {
            res.send("please signup first")
        } else {
            if (docs.status == 1) {

                if (req.body.email != "admin@gmail.com") {

                    if (err) {
                        console.log(err + "error")
                        /* res.render("HOME/") */
                        res.send("error inside signin post")
                    }
                    else {
                        if (req.body.password == docs.password) {
                            /* res.setHeader('Content-Type', 'text/ejs'); */
                            /* console.log("password true") */
                            if(docs.type == "principal"){
                                req.session.isAuth = true;
                                req.session.username = docs.fname
                                req.session.rid = docs.rid
                               /*  req.session.dep = docs.department */
                                /* res.render("USERS/STUDENT/newsfeed") */
                                /*  console.log("before redirecting") */

                                res.redirect("/principal/newsfeed")
                            }else if (docs.type != "other") {
                                req.session.isAuth = true;
                                req.session.username = docs.fname
                                req.session.rid = docs.rid
                                req.session.dep = docs.department
                                /* res.render("USERS/STUDENT/newsfeed") */
                                /*  console.log("before redirecting") */

                                res.redirect("/newsfeed")
                            }
                            else {
                                req.session.isAuth = true;
                                req.session.username = docs.fname
                                req.session.rid = docs.rid

                                /* res.render("USERS/STUDENT/newsfeed") */
                                /*  console.log("before redirecting") */

                                res.redirect("/other/newsfeed")

                            }

                        }
                        else {
                            res.render("HOME/index")
                        }
                    }
                } else {
                    req.session.isAuth = true;
                    res.redirect("/admin/newsfeed");
                }
            } else if (docs.status == 0) {
                res.send("admin not approved");
            }
            else {
                res.send("admin rejected");
            }
        }
    });



    /* res.render("HOME/signin") */
})


//-Signup
app.get("/signup", (req, res) => {
    Department.find({}).exec((err, data) => {

        res.render("HOME/signup", {
            data: data
        })
    })
})

app.post("/signup", upload.single("image"), async (req, res) => {

    console.log(req.body.type)

    if (req.body.type == "other") {


        if (typeof (req.file) === "undefined") {
            let register = new Register
                ({
                    type: req.body.type,
                    fname: req.body.fname,
                    lname: req.body.lname,

                    rid: req.body.rid,
                    email: req.body.email,
                    password: req.body.password,
                    hod: false
                    /* img : req.file.filename */
                })
            register.save();
            res.render("HOME/signin")

        } else {
            let register = new Register
                ({
                    type: req.body.type,
                    fname: req.body.fname,
                    lname: req.body.lname,

                    rid: req.body.rid,
                    email: req.body.email,
                    password: req.body.password,
                    hod: false,
                    img: req.file.filename
                })
            register.save();

        }


    }
    else {

        Department.findOne({ _id: req.body.department }, async (err, data) => {


            let val = false;
            if (data.hod == req.body.rid) {

                val = true;
            }


            if (typeof (req.file) === "undefined") {



                let register = new Register
                    ({
                        type: req.body.type,
                        fname: req.body.fname,
                        lname: req.body.lname,
                        department: req.body.department,
                        rid: req.body.rid,
                        email: req.body.email,
                        password: req.body.password,
                        hod: val
                        /* img : req.file.filename */
                    })
                /* console.log(register) */
                await register.save()

                /* .then(savedDoc => {
                    if(savedDoc === register1)
                    console.log("saved succesfully")
                }).catch(err =>{
                    console.log("error occured at signup post")
                }
                ) */
                fullname = req.body.fname + " " + req.body.lname

                /*  Department.findOne({_id:  req.body.department}).exec((err,data)=>
                {
                    if(err)
                   console.log(err)
                    console.log("atleast  im here")
                    console.log(data)
                    console.log(data.students.length)
                    let len = data.students.length;
                    data.students[len]=fullname;
                    console.log(data.students)
                    data.save(function (err) {
                        if (!err) {
                            
                            
                       }
                       else {
                           console.log(err);
                       }
                   });
                   
               })
               */
                //
                if (req.body.type == "student") {
                    Register.findOne({ rid: req.body.rid }).exec((err, data) => {
                        Department.updateOne(
                            { _id: req.body.department },
                            { $push: { students: data._id } },
                            (error, success) => {
                                if (error) {
                                    console.log(error);
                                } else {
                                    Department.findOne({ _id: req.body.department })
                                        .populate("students")
                                        .then(data => {
                                            res.render("HOME/signin")
                                            /* console.log(data); */
                                        })



                                }
                            })

                    })

                } else if (req.body.type == "teacher") {
                    Register.findOne({ rid: req.body.rid }).exec((err, data) => {
                        Department.updateOne(
                            { _id: req.body.department },
                            { $push: { teachers: data._id } },
                            (error, success) => {
                                if (error) {
                                    console.log(error);
                                } else {
                                    Department.findOne({ _id: req.body.department })
                                        .populate("teachers")
                                        .then(data => {
                                            res.render("HOME/signin")

                                        })



                                }
                            })
                    })
                }



                else {
                    console.log("othersssss line 418")
                    res.render("HOME/signin")

                }
                //




            }
            else {
                let register = new Register
                    ({
                        type: req.body.type,
                        fname: req.body.fname,
                        lname: req.body.lname,
                        department: req.body.department,
                        rid: req.body.rid,
                        email: req.body.email,
                        password: req.body.password,
                        img: req.file.filename,
                        hod: val,
                    })
                /* console.log(register) */
                await register.save()

                /* .then(savedDoc => {
                    if(savedDoc === register1)
                    console.log("saved succesfully")
                }).catch(err =>{
                    console.log("error occured at signup post")
               }
               ) */


                if (req.body.type == "student") {
                    Register.findOne({ rid: req.body.rid }).exec((err, data) => {
                        Department.updateOne(
                            { _id: req.body.department },
                            { $push: { students: data._id } },
                            (error, success) => {
                                if (error) {
                                    console.log(error);
                                } else {
                                    Department.findOne({ _id: req.body.department })
                                        .populate("students")
                                        .then(data => {
                                            res.render("HOME/signin")
                                            /* console.log(data); */
                                        })



                                }
                            })

                    })

                } else if (req.body.type == "teacher") {
                    Register.findOne({ rid: req.body.rid }).exec((err, data) => {
                        Department.updateOne(
                            { _id: req.body.department },
                            { $push: { teachers: data._id } },
                            (error, success) => {
                                if (error) {
                                    console.log(error);
                                } else {
                                    Department.findOne({ _id: req.body.department })
                                        .populate("teachers")
                                        .then(data => {
                                            res.render("HOME/signin")

                                        })



                                }
                            })
                    })
                }



                else {
                    console.log("othersssss line 418")
                    res.render("HOME/signin")

                }
                //

                // res.render("HOME/signin")

            }
        })
    }
})


//- DEPARTMENTS
app.get("/departments", isAuth, (req, res) => {


    Register.findOne({ rid: req.session.rid }).populate("department").exec((err, docs) => {

        Department.find().exec((err, docs2) => {


            /* console.log(docs.fname) */



            res.render("USERS/STUDENT/departments", {
                name: docs.fname,
                fname: docs.fname,
                topdep: docs.department.department,
                deplist: docs2
            })
        })
    })
})

// STUDENT COLLEGE PROFILE

app.get("/college",(req,res)=>{

    Feed.find({ $and: [
            { princi: 1 },
            { status: 1 }
        ]}).sort('-date').populate("author").exec((err,data)=>
    {

        
        Register.findOne({ rid: req.session.rid }).exec((err,docs)=>{

            
            if(docs.hod ){
                
                Feed.find({ $and: [
                    { princi: 1 },
                    { status: 0 },
                    {rid : docs.rid}
                ]}).sort('-date').exec((err,dat)=>{
                   
                    res.render("USERS/STUDENT/college",{
                        path: "/departments",
                        doc: data,
                        datlen : dat.length,
                        dat: dat
                    })

                
                    
                })

            }else{
                  res.render("USERS/STUDENT/college",{
                 path: "/departments",
                 doc: data,
                 datlen
                   : 0
                })
            }


        })
       

    })
   
})




// DEPARTMENT PROFILE


app.get("/departmentProfile/:dep", isAuth, (req, res) => {



    /*  let depname = req.params.dep */

    Feed.find({ $and: [{ departmentName: req.params.dep }, { status: 1 }] }).populate("author").sort('-date').exec((err, docs) => {

        res.render("USERS/STUDENT/department-profile", {
            path: "/departments",
            depname: req.params.dep,
            doc: docs

        })
    })



})

// MEMBERS PROFILE AND LISTS

app.get("/:dep/members", isAuth, (req, res) => {



    /*  let depname = req.params.dep */
    Register.find().populate("department").exec((err,data)=>
    {
        // for(let i=0; i<data.length;i++){
            
        //     if(data[i].department != undefined){

        //         if(data[i].department.department == req.params.dep)
        //         {
                   
        //             res.render("USERS/STUDENT/members",{
        //                 name : data[i].fname +" "+ data[i].lname,
        //                 rid: dat
        //               })
        //         }
        
        //     }
        
        // }
        
        
            res.render("USERS/STUDENT/members",{
                data : data,
                path: "/departmentProfile/"+req.params.dep,
                dep : req.params.dep
              })
        
        
    })
   
   


})




//  app.get("/:dept/:ridd", isAuth, (req, res) => {



//     /*  let depname = req.params.dep */
//     Register.findOne({rid : req.params.ridd},(err,data)=>{
//  Feed.find({ $and: [{ departmentName: req.params.dept }, { status: 1 } ,{rid : req.params.ridd}] }).sort('-date').populate("author").exec((err, docs) => {
//         console.log(docs.author)
//         // res.send("working")
//         res.render("USERS/STUDENT/memberPrf", {
//             path: "/"+req.params.dept+"/members",
//             depname: req.params.dept,
//             doc: docs,
//             data: data

//         })
//     })


//     })
   
   
// })
 







//- STUDENT-PROFILE
app.get("/studentPrf", isAuth, (req, res) => {

    Register.findOne({ rid: req.session.rid }).populate("department").sort('-date').exec((err, docs) => {


        if (!docs.hod) {

            Feed.find({ rid: req.session.rid }).sort('-date').exec((err, data) => {

                res.render("USERS/STUDENT/studentPrf", {
                    name: docs.fname,
                    fname: docs.fname + " " + docs.lname,
                    rid: docs.rid,
                    dep: docs.department.department,
                    img: docs.img,
                    /*   power:docs.power, */
                    left: "Approved",
                    right: "Pending",
                    data: data
                })


            })
        }
        else {
            Feed.find({ rid: req.session.rid }).sort('-date').exec((err, data) => {

                Feed.find({
                    $and: [
                        { departmentName: docs.department.department },
                        { status: 0 }
                    ]
                }).populate("author").sort('-date').exec((err, dat) => {
                    //{$and : [{departmentName : "Computer Science" },{appro : false}]}
                    if (err) console.log("error occured")
                    // { $and: [ { price: { $ne: 1.99 } }, { price: { $exists: true } } ] }


                    res.render("USERS/STUDENT/hod", {
                        name: docs.fname,
                        fname: docs.fname + " " + docs.lname,
                        rid: docs.rid,
                        img: docs.img,
                        dep: docs.department.department,
                        left: "Posted",
                        right: "Requests",
                        data: data,
                        dat: dat,

                    })




                })


            })


        }

        //   res.send("nothing worked")



    })

    /* res.render("USERS/STUDENT/studentPrf") */
})


app.get("/college/compose", isAuth, (req, res) => {

    Register.findOne({ rid: req.session.rid }).populate("department").exec((err, docs) => {

        res.render("USERS/STUDENT/collegeCompose", {
            name: docs.fname,
            fname: docs.fname,
            dep: docs.department.department,
            rid: docs.rid,
            id: docs._id,
        })
    })


})


app.post("/college/compose",upload.single("image"),(req,res)=>{

    console.log(req.body.dep+"helo")
    if (typeof (req.file) === "undefined") {
        
    let feed = new Feed({
        author: req.body.id,
        title: req.body.title,
        feed: req.body.post,
        rid: req.body.rid,
        departmentName: req.body.dep,
        status: 0,
        princi: 1
    })
    feed.save();
    
res.redirect("/college")
}else{
    let feed = new Feed({
        author: req.body.id,
        title: req.body.title,
        feed: req.body.post,
        rid: req.body.rid,
        departmentName: req.body.dep,
        status: 0,
        princi: 1,
        img: req.file.filename,
    })
    
feed.save();
res.redirect("/college")
}


})






// PRINCIPAL

app.get("/principal/newsfeed",(req,res)=>{
    Register.findOne({ rid: req.session.rid }, (err, docs) => {
        Feed.find({ status: 1 }).populate("author").sort('-date').exec((err, docs2) => {


            res.render("USERS/PRINCIPAL/newsfeed", {
                name: docs.fname,
                fname: docs.fname,
                /*  rid : docs.rid */
                doc: docs2
            })
        })

    })
    
})
app.get("/principal/departments",(req,res)=>{
    Register.findOne({ rid: req.session.rid }).exec((err, docs) => {

        Department.find().exec((err, docs2) => {


            /* console.log(docs.fname) */

            console.log(docs2);

            res.render("USERS/PRINCIPAL/departments", {
                name: docs.fname,
                fname: docs.fname,
                
                deplist: docs2
            })
        })
    })

})


app.get("/principalDepartment/:dep", isAuth, (req, res) => {



    /*  let depname = req.params.dep */

    Feed.find({ $and: [{ departmentName: req.params.dep }, { status: 1 }] }).populate("author").sort('-date').exec((err, docs) => {

        res.render("USERS/PRINCIPAL/department-profile", {
            path: "/principal/departments",
            depname: req.params.dep,
            doc: docs

        })
    })



})


app.get("/principal/profile",(req,res)=>{

   Register.findOne({rid: req.session.rid}).exec((err,docs)=>{

    Feed.find({ $and: [
        { princi: 1 },
        { status: 0 }
    ]}).sort('-date').exec((err,dat)=>{

        Feed.find({ $and: [
            { princi: 1 },
            { status: 1 }
        ]}).sort('-date').exec((err,data)=>{

        res.render("USERS/PRINCIPAL/princi", {
                name: docs.fname,
                fname: docs.fname + " " + docs.lname,
                rid: docs.rid,
                img: docs.img,
                
                left: "Posted",
                right: "Requests",
                data: data,
                dat: dat,

            })
        })



    })



   })
   

})


app.get("/principal/compose",(req,res)=>{

    Register.findOne({ type : "principal" }).exec((err, docs) => {

        res.render("USERS/PRINCIPAL/compose", {
            name: docs.fname,
            fname: docs.fname,
            
            rid: docs.rid,
          
            id: docs._id,
        })
    })


})


app.post("/principal/compose",upload.single("image"),(req,res)=>{


    //
    Register.findOne({ type : "principal" }).exec((err, docs) => {

     
          
    let id = docs._id;
     
    

    //

    if(typeof (req.file) === "undefined") {
        
    let feed = new Feed({
        title: req.body.title,
        feed: req.body.post,
        rid: req.body.rid,
        status: 1,
        princi: 1,
        // author: ObjectId("6077004b351d512b70481021")
        author: id
    })
    feed.save();
    console.log(feed)
res.redirect("/principal/profile")
}else{
    let feed = new Feed({
        title: req.body.title,
        feed: req.body.post,
        rid: req.body.rid,
        status: 1,
        princi: 1,
        img: req.file.filename,
        author: id
    })
    console.log(feed)
feed.save();
res.redirect("/principal/profile")
}

})
})


app.get("/principal/college",(req,res)=>{

    Feed.find({ $and: [
            { princi: 1 },
            { status: 1 }
        ]}).sort('-date').populate("author").exec((err,data)=>
    {
         res.render("USERS/PRINCIPAL/college",{
        path: "/principal/departments",
        doc: data
    })

    })
   
})


// OTHER PROFILE

app.get("/other/newsfeed", isAuth, (req, res) => {

    Feed.find({ status: 1 }).populate("author").sort('-date').exec((err, docs2) => {



        res.render("USERS/OTHER/othernewsfeed", {

            /*  rid : docs.rid */
            doc: docs2
        })
    })


})

app.get("/other/departments", isAuth, (req, res) => {

    Department.find().exec((err, docs2) => {


        /* console.log(docs.fname) */



        res.render("USERS/OTHER/otherdepartmentlist", {
            /*  name: docs.fname,
             fname: docs.fname,
             topdep: docs.department.department, */
            deplist: docs2
        })
    })

})

app.get("/other/:dep", isAuth, (req, res) => {



    /*  let depname = req.params.dep */

    Feed.find({ $and: [{ departmentName: req.params.dep }, { status: 1 }] }).sort('-date').exec((err, docs) => {

        res.render("USERS/STUDENT/department-profile", {
            path: "/other/departments",
            depname: req.params.dep,
            doc: docs

        })
    })



})


app.get("/otherCollege",(req,res)=>{

    Feed.find({ $and: [
            { princi: 1 },
            { status: 1 }
        ]}).sort('-date').populate("author").exec((err,data)=>
    {
         res.render("USERS/OTHER/college",{
        path: "/other/departments",
        doc: data
    })

    })
   
})





//- ADMIN

app.get("/admin/requests", isAuth, (req, res) => {

    Register.find({ status: 0 }).populate('department').sort('-date').exec((err, data) => {
        console.log(data)
        res.render("USERS/ADMIN/requests", {
            data: data,
        })
    })



}
)

app.post("/acceptuser", (req, res) => {

    Register.findOne({ rid: req.body.accept }, (err, data) => {

        data.status = 1;
        /* let somdate = new date; */
        data.date = Date.now();
        data.save(function (err) {
            if (!err) {
                console.log(data)
                res.redirect("/admin/requests")
                // console.log("contact " + contact.phone + " created at " + contact.createdAt + " updated at " + contact.updatedAt);
            }
            else {
                console.log("Error: could not save contact ");
            }
        });

    })

}
)
app.post("/rejectuser", (req, res) => {

    Register.findOne({ _id: req.body.accept }, (err, data) => {
        data.status = -1;
        /* let somdate = new date; */
        data.date = Date.now();
        data.save(function (err) {
            if (!err) {
                res.redirect("/admin/requests")
                // console.log("contact " + contact.phone + " created at " + contact.createdAt + " updated at " + contact.updatedAt);
            }
            else {
                console.log("Error: could not save contact ");
            }
        });

    })


}
)




app.get("/admin/handling", isAuth, (req, res) => {

    req.session.depart = undefined;
    Department.find({}).exec((err, data) => {
        Register.findOne({ type: "principal" }).exec((err, doc) => {
            if (doc == null) {
                res.render("USERS/ADMIN/handling", {
                    name: "NULL",
                    data: data,
                    imgName: "pen"
                })
            } else {
                res.render("USERS/ADMIN/handling", {
                    name: doc.fname + " " + doc.lname,
                    data: data,
                    imgName: "trash"
                })
            }
        })

    })


}
)


app.post("/admin/handling", isAuth, (req, res) => {

    req.session.depart = undefined;

    if (req.body.delete == undefined) {

        req.session.depart = req.body.edit;

        res.redirect("/admin/compose")
    }
    else {
        console.log(req.body.delete)
        Register.find({}).populate("department").exec((err, data) => {
            var count=0;
            for(i=0; i< data.length;i++)
            {
                
              if(data[i].department == undefined) { continue} 
              else{
                  console.log(data[i].department.department)
              if(  data[i].department.department == req.body.delete )
              {
                  
                  count++;
              }
            }
            }
            
            if (count == 0) {
                Department.deleteOne({ department: req.body.delete }, (err, data2) => {
                    if (!err) console.log("succesfully deleted line:881")
                    console.log(err);
                });
                res.redirect("/admin/handling");

            }else{
                res.send("users exist in this department, so can't delete")
            }
        })


    }


}
)


app.post("/admin/handling/deleteprinci", (req, res) => {
    Register.deleteOne({ type: "principal" }, (err, data2) => {
        if (!err) console.log("succesfully deleted ")
        console.log(err);
    });
    res.redirect("/admin/handling");
})

app.get("/admin/newsfeed", isAuth, (req, res) => {
    /*   console.log(req.session.rid)
      console.log(req.session.username) */


    Feed.find({ status: 1 }).populate("author").sort('-date').exec((err, docs2) => {



        res.render("USERS/ADMIN/adminNewsfeed", {

            /*  rid : docs.rid */
            doc: docs2
        })
    })




})

// PRINCIPAL CREATION

app.get("/admin/princi", (req, res) => {
    /* res.send("working") */
    res.render("USERS/ADMIN/adminPrinci");
})



app.post("/admin/princi", upload.single("image"), (req, res) => {
    Register.findOne({ type: "principal" }).exec((err, data) => {

        if (data == null) {
            if (typeof (req.file) == "undefined") {
                let register = new Register({
                    type: "principal",
                    fname: req.body.fname,
                    lname: req.body.lname,
                    rid: req.body.rid,
                    status: 1,
                    email: req.body.email,
                    password: req.body.password
                })
                register.save()
                console.log("not file")
                res.redirect("/admin/handling")

            } else {
                let register = new Register({
                    type: "principal",
                    fname: req.body.fname,
                    lname: req.body.lname,
                    rid: req.body.rid,
                    status: 1,
                    email: req.body.email,
                    password: req.body.password,
                    img: req.file.filename
                })
                register.save()
                console.log("file")
                res.redirect("/admin/handling")
            }
        } else {
            res.send("college should have only one principal ")
        }

    })



})



app.get("/admin/compose", isAuth, (req, res) => {


    if (req.session.depart == undefined) {
        console.log("plus icon ")
        res.render("USERS/ADMIN/adminCompose", {
            data: "null",
        })
    }
    else {
        doc = req.session.depart;
        // req.session.depart = undefined;
        console.log("delete icon ")
        res.render("USERS/ADMIN/adminCompose", {
            data: doc,
        })
    }

}
)


app.post("/admin/compose/add", (req, res) => {
    req.session.depart = undefined;
    Department.findOne({ department: req.body.dep }, (err, data) => {
        if (data == undefined) {
            Register.findOne({ rid: req.body.hod }, (err, data2) => {
                if (data2 != undefined) {
                    res.send("ID holder already exist in the database line:995")
                } else {
                    let department = new Department(
                        {
                            department: req.body.dep,
                            hod: req.body.hod
                        })
                    department.save();
                    res.redirect("/admin/handling")
                }
            })
        }else{
            res.send("department already exist")
        }
    })
})

app.post("/admin/compose/edit", (req, res) => {
    req.session.depart = undefined;
    Department.findOne({ department: req.body.dep }, (err, data) => {
        if (data == undefined) {
            res.send("That department doesn't exist line:1014")
        }
        else {
            Register.findOne({ rid: req.body.hod }, (err, data2) => {
                if (data2 == undefined) {
                    res.send("That HOD doesn't exist")
                } else if (data2.type == "teacher") {
                    data.hod = req.body.hod
                    data.save()

                } else {
                    res.send("ID holder isn't a teacher")
                }
            })
        }
    })
})



/* app.post("/admin/compose", (req, res) => {
    req.session.depart = undefined;
    Register.findOne({ rid: req.body.hod }, (err, daataa) => {

        if (daataa == undefined) {
            Department.findOne({department : req.body.dep},(err,data2)=>
            {
                if(data2 == undefined){
                    let department = new Department(
                    {
                        department: req.body.dep,
                        hod: req.body.hod
                    })
                department.save();
                res.redirect("/admin/handling")
                }
                else{
                    res.send("this department already exist err: 1010")
                }
            })
            

        } else if (daataa.type == "teacher") {

            Department.find({ department: req.body.dep }).exec((err, data) => {

                if (data.length == 0) {
                    let department = new Department(
                        {
                            department: req.body.dep,
                            hod: req.body.hod
                        }
                    )

                    department.save();
                    res.redirect("/admin/handling")

                } else if (req.body.helper == "plus") {
                    res.send("Department already exists")
                }
                else {

                    Register.findOne({ rid: data[0].hod }, (err, doc1) => {
                        // console.log(doc1.hod)
                        doc1.hod = false;
                        // console.log(doc1.hod)
                        doc1.save();
                        // console.log("first register query")


                        Register.findOne({ rid: req.body.hod }, (err, doc2) => {
                            data[0].hod = req.body.hod;
                            // console.log(data[0].hod+" oh no "+req.body.hod);
                            // console.log("second register query"+doc2)
                            doc2.hod = true;
                            // console.log(doc2)
                            doc2.save();
                            data[0].save();
                            res.redirect("/admin/handling")
                        })
                    })




                }


            })

        } else {
            res.send("only teachers can be hod")
        }
    })


    // console.log("compose post working !!")



}
) */



//- NEWSFEED
app.get("/newsfeed", isAuth, (req, res) => {
    /*   console.log(req.session.rid)
      console.log(req.session.username) */

    Register.findOne({ rid: req.session.rid }, (err, docs) => {
        Feed.find({ status: 1 }).populate("author").sort('-date').exec((err, docs2) => {


            res.render("USERS/STUDENT/newsfeed", {
                name: docs.fname,
                fname: docs.fname,
                /*  rid : docs.rid */
                doc: docs2
            })
        })

    })


})


//-COMPOSE

app.get("/compose", isAuth, (req, res) => {

    Register.findOne({ rid: req.session.rid }).populate("department").exec((err, docs) => {

        res.render("USERS/STUDENT/compose", {
            name: docs.fname,
            fname: docs.fname,
            dep: docs.department.department,
            rid: docs.rid,
            hod: docs.hod,
            id: docs._id,
        })
    })


})

app.post("/compose", upload.single("image"), (req, res) => {
    let feed;


    if (req.body.hod == 'true') {

        if (typeof (req.file) === "undefined") {
            feed = new Feed({
                author: req.body.id,
                departmentName: req.body.dep,
                title: req.body.title,
                feed: req.body.post,
                rid: req.body.rid,
                status: 1,
                /*   img: req.file.filename, */
            })

            /*   notification = new Noti({
                 rid : req.body.title,
                 pending: req.body.post,
     
              })
      */

            /* console.log(feed) */
        } else {
           /*  if (typeof (req.file) === "undefined") { */
                feed = new Feed({
                    author: req.body.id,
                    departmentName: req.body.dep,
                    title: req.body.title,
                    feed: req.body.post,
                    rid: req.body.rid,
                    status: 1,
                    img: req.file.filename,
                })
           /*  } */
        }
    }
    else {

        if (typeof (req.file) === "undefined") {
            feed = new Feed({
                author: req.body.id,
                departmentName: req.body.dep,
                title: req.body.title,
                feed: req.body.post,
                rid: req.body.rid,
                status: 0,
                /* img: req.file.filename, */
            })
        }
        else {
            feed = new Feed({
                author: req.body.id,
                departmentName: req.body.dep,
                title: req.body.title,
                feed: req.body.post,
                rid: req.body.rid,
                status: 0,
                img: req.file.filename,
            })
        }
    }

    feed.save()
    /*  notification.save() */

    /*  console.log("in compose post") */


    res.redirect("/studentPrf")

})



//- SIGN OUT
app.get("/signOut", (req, res) => {
    req.session.isAuth = false
    req.session.destroy((err) => {
        if (err) throw err;
        res.redirect("/signin");
    })
})


//- ACCEPT AND REJECT

app.post("/reject", (req, res) => {

    Feed.findOne({ _id: req.body.reject }, (err, data) => {
        /* if(!err)
        {
            res.redirect("/studentPrf")
        }
        else
        {
            console.log("error occured ")
        } */

        data.status = -1;
        data.save(function (err) {
            if (!err) {
                res.redirect("/studentPrf")
                // console.log("contact " + contact.phone + " created at " + contact.createdAt + " updated at " + contact.updatedAt);
            }
            else {
                console.log("Error: ");
            }
        });

    })


})

app.post("/accept", (req, res) => {
    Feed.findOne({ _id: req.body.accept }, (err, data) => {
        data.status = 1;
        /* let somdate = new date; */
        data.date = Date.now();
        data.save(function (err) {
            if (!err) {
                res.redirect("/studentPrf")
                // console.log("contact " + contact.phone + " created at " + contact.createdAt + " updated at " + contact.updatedAt);
            }
            else {
                console.log("Error: could not save contact " );
            }
        });

    })
})

app.post("/rejectPrinci", (req, res) => {

    Feed.findOne({ _id: req.body.reject }, (err, data) => {
        /* if(!err)
        {
            res.redirect("/studentPrf")
        }
        else
        {
            console.log("error occured ")
        } */

        data.status = -1;
        data.save(function (err) {
            if (!err) {
                res.redirect("/principal/profile")
                // console.log("contact " + contact.phone + " created at " + contact.createdAt + " updated at " + contact.updatedAt);
            }
            else {
                console.log("Error: ");
            }
        });

    })


})

app.post("/acceptPrinci", (req, res) => {
    Feed.findOne({ _id: req.body.accept }, (err, data) => {
        data.status = 1;
        /* let somdate = new date; */
        data.date = Date.now();
        data.save(function (err) {
            if (!err) {
                res.redirect("/principal/profile")
                // console.log("contact " + contact.phone + " created at " + contact.createdAt + " updated at " + contact.updatedAt);
            }
            else {
                console.log("Error: could not save contact ");
            }
        });

    })
})

app.get("/:dept/:ridd", isAuth, (req, res) => {

    

    /*  let depname = req.params.dep */
    Register.findOne({rid : req.params.ridd},(err,data)=>{

 Feed.find({ $and: [{ departmentName: req.params.dept }, { status: 1 } ,{rid : req.params.ridd}] }).sort('-date').populate("author").exec((err, docs) => {
        console.log(docs.author)
        // res.send("working")
        res.render("USERS/STUDENT/memberPrf", {
           
            depname: req.params.dept,
            doc: docs,
            data: data

        })
    })


    })
   
   
})




/****************************************LISTEN PORT **************************************** */
app.listen(1003, () => console.log("listening at http://localhost:1003"))
