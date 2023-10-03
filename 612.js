(req, res) => {
    let db = req.app.db;

    db.users.findOne({userEmail: common.mongoSanitize(req.body.email)}, (err, user) => {
        if(err){
            res.status(400).json({message: 'A user with that email does not exist.'});
            return;
        }

        // check if user exists with that email
        if(user === undefined || user === null){
            res.status(400).json({message: 'A user with that email does not exist.'});
        }else{
            // we have a user under that email so we compare the password
            bcrypt.compare(req.body.password, user.userPassword)
            .then((result) => {
                if(result){
                    req.session.user = req.body.email;
                    req.session.usersName = user.usersName;
                    req.session.userId = user._id.toString();
                    req.session.isAdmin = user.isAdmin;
                    res.status(200).json({message: 'Login successful'});
                }else{
                    // password is not correct
                    res.status(400).json({message: 'Access denied. Check password and try again.'});
                }
            });
        }
    });
}