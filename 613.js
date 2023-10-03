async (req, res) => {
    let db = req.app.db;

    db.customers.findOne({email: common.mongoSanitize(req.body.loginEmail)}, (err, customer) => { // eslint-disable-line
        if(err){
            // An error accurred
            return res.status(400).json({
                message: 'Access denied. Check password and try again.'
            });
        }

        // check if customer exists with that email
        if(customer === undefined || customer === null){
            return res.status(400).json({
                message: 'A customer with that email does not exist.'
            });
        }
        // we have a customer under that email so we compare the password
        bcrypt.compare(req.body.loginPassword, customer.password)
        .then((result) => {
            if(!result){
                // password is not correct
                return res.status(400).json({
                    message: 'Access denied. Check password and try again.'
                });
            }

            // Customer login successful
            req.session.customer = customer;
            return res.status(200).json({
                message: 'Successfully logged in',
                customer: customer
            });
        })
        .catch((err) => {
            return res.status(400).json({
                message: 'Access denied. Check password and try again.'
            });
        });
    });
}