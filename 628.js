(err, product) => {
            if(err){
                console.info(err.stack);
                // delete the temp file.
                fs.unlinkSync(file.path);

                // Redirect to error
                req.session.message = 'File upload error. Please try again.';
                req.session.messageType = 'danger';
                res.redirect('/admin/product/edit/' + req.body.productId);
                return;
            }

            const productPath = product.productPermalink;
            let uploadDir = path.join('public/uploads', productPath);

            // Check directory and create (if needed)
            common.checkDirectorySync(uploadDir);

            let source = fs.createReadStream(file.path);
            let dest = fs.createWriteStream(path.join(uploadDir, file.originalname.replace(/ /g, '_')));

            // save the new file
            source.pipe(dest);
            source.on('end', () => { });

            // delete the temp file.
            fs.unlinkSync(file.path);

            let imagePath = path.join('/uploads', productPath, file.originalname.replace(/ /g, '_'));

            // if there isn't a product featured image, set this one
            if(!product.productImage){
                db.products.update({_id: common.getId(req.body.productId)}, {$set: {productImage: imagePath}}, {multi: false}, (err, numReplaced) => {
                    if(err){
                        console.info(err.stack);
                    }
                    req.session.message = 'File uploaded successfully';
                    req.session.messageType = 'success';
                    res.redirect('/admin/product/edit/' + req.body.productId);
                });
            }else{
                req.session.message = 'File uploaded successfully';
                req.session.messageType = 'success';
                res.redirect('/admin/product/edit/' + req.body.productId);
            }
        }