exports.check_login = (req,res,next)=>{
    if (req.session.userLogin){
        //da dang nhap
        next();
    }else{
        res.redirect('/');
    }
}
exports.check_token= (req,res,next)=>{
    const token = req.headers.authorization && req.headers.authorization.split(' ')[1]; // lấy token từ header
    if( token == req.session.token){
        next();
    }else{
        res.redirect('/');
    }
}