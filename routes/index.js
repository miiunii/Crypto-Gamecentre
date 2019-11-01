const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const author = require('../config/author.json');
const ethereum = require('ethereumjs-tx');
const crypto = require('crypto');
const Web3 = require('web3');
const chip = require('../utils/chip.json')
const db = require('../utils/db.js');
const auth = require('../utils/auth.js');

const web3 = new Web3(new Web3.providers.HttpProvider('https://rinkeby.infura.io'));
const contract = new web3.eth.Contract(chip, '0x6bFF99C3761669c2f1ce78466C21DcB7fb8DE6E0');
const Tx = ethereum.Transaction;

// router.use(metaMask({
//     window.addEventListener('load', () => {
//         if(typoeof(web3) == 'undefined') {
//           return console.log("Metamask is not installed");
//         }
//     })}))

router.get('/', function (req, res) {
    let statusUI = auth.statusUI(req, res);
    if(req.session){
        msg = `${req.session.loginId}로 로그인`
    }
    if(typeof web3.ethereum !== 'undefined'
        || typeof window.web3 !== 'undefined') {
            const provider = window['ethereum'] || window.web3.currentProvider
        ethereum.isMetaMask;
        ethereum.enable();
    }
    /*
    if(ethereum.isMetaMask){
        let accounts = ethereum.enable();
        let account = accounts[0];
    }
    */
    console.log(msg);
    res.render('index', {
        statusUI
    });
})

router.post('/contact', function (req,res){
    let userId = req.body['id'];
    let userMessage = req.body['message'];
    let loginId = req.session.loginId;
    
    if(userId == loginId){
        
        res.json({"msg" : "success"})
        
        let mailerid = author.emailId(req,res);
        let mailerpass = author.emailPass(req,res);
        var transporter = nodemailer.createTransport({
            service: 'naver',
            auth: {
                user: mailerid,
                pass: mailerpass
            }
        });
        
        var mailOptions = {
            from: 'Game_Centre contact <dnflwlq3231@naver.com>',
            to: mailerid,
            subject: 'claim',
            text: 'claim ID :   ' + userId +  '\nclaim message :  \n       ' + userMessage 
        };
        
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log(error);
            }
            else {
                console.log('Email sent!: ' + info.response);
            }
            transporter.close();
        
        });
    }
    else if(userId != loginId){
        if(loginId == undefined){
            res.json({"msg" : "error"})
        }
        else{
            res.json({"msg" : "false"})
        }
    }   
})

router.get('/login', function (req, res) {
    // req.session.destroy();
    res.render('login');
})

router.post('/login_process', function(req, res){    
    let userId = req.body['id'];
    let userPw = req.body['password'];

    let salt = 'cryptoGamecentre';
    let pbkdf2 = crypto.pbkdf2Sync(userPw, salt, 1004, 64, 'sha512').toString('hex');
    
    db.query('select * from user where user.id=? ', [userId], function(err, userinfo){
        if(err){
            throw err;
        }
         if(userinfo[0] == null || userinfo[0].password != pbkdf2){       
            console.log("login failed")
            res.json({"msg" : "failed"})
        }
        else if(userinfo[0].password == pbkdf2){
            console.log("login successed")
            req.session.loginId = userId;
            req.session.isLogined = true;
            req.session.isAddress = userinfo[0].address;
            res.json({"msg": "success"})
        }
    })
})

router.get('/logout', function(req,res){
    req.session.destroy(function(err){
        console.log("logout");
        res.redirect('/');   
    });
})

router.get('/profile', function (req, res) {
    
    if(req.session.loginId != undefined){
        let id = req.session.loginId;
        db.query('select * from user where user.id=?', [id], function(err, data){
            res.render('profile', {
                data
            })
        })
    }
    else if(req.session.loginId == undefined){
        res.redirect('/login');
    }
})

router.post('/profile_process', function(req,res){
    let userId = req.session.loginId;
    let userAddress = req.body['address'];
    let userEmail = req.body['email'];
    let userPw = req.body['password'];
    let salt = 'cryptoGamecentre';
    let pbkdf2 = crypto.pbkdf2Sync(userPw, salt, 1004, 64, 'sha512').toString('hex');

    db.query('update user set user.email=?, user.address=?, user.password=? where user.id=?', [userEmail, userAddress, pbkdf2, userId], function(err, result){
        if(err){
            throw err;
        }
        else { 
            res.json({});
        }
    })
})

router.get('/signup', function (req, res) {
    res.render('signup');
})

router.post('/signup_process', function(req, res){
    let userId = req.body['id'];
    let userPw = req.body['password'];
    let userEmail = req.body['email'];
    let userAddress = req.body['address'];
    let salt = 'cryptoGamecentre';
    let pbkdf2 = crypto.pbkdf2Sync(userPw, salt, 1004, 64, 'sha512').toString('hex'); 

    db.query(`insert into user (id, password, email, address) values (?, ?, ?, ?)`, [userId, pbkdf2, userEmail, userAddress], function(err, result){
        if(err){
            res.json({"msg" : "error"})
        }
        else {
            res.json({"msg" : "success"})
        }
    });
});

router.get('/forgot', function (req,res){
    res.render('forgot');
})

router.post('/forgot_process', function(req,res){
    let userId = req.body['id'];
    let userEmail = req.body['email'];
    let arr = "0,1,2,3,4,5,6,7,8,9,a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u,v,w,x,y,z,A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z,!,@,#,$,%,^,&,*,?".split(",");
    let randomPw = createCode(arr, 10);
    let salt = 'cryptoGamecentre';
    let pbkdf2 = crypto.pbkdf2Sync(randomPw, salt, 1004, 64, 'sha512').toString('hex');

    function createCode(objArr, iLength) {
        var arr = objArr;
        var ranpw = "";
        for (var j=0; j<iLength; j++) {
        ranpw += arr[Math.floor(Math.random()*arr.length)];
        }
        return ranpw;
    }

    db.query('select * from user where user.id=?', [userId], function(err,data){
        
        if(err){
            throw err;
        }
        else if(data[0] == null || data[0].email != userEmail){
            res.json({"msg" : "error"});     
        }
        else if(data[0].email == userEmail){
            let mailerid = author.emailId(req,res);
            let mailerpass = author.emailPass(req,res);
            var transporter = nodemailer.createTransport({
                service: 'naver',
                auth: {
                    user: mailerid,
                    pass: mailerpass
                }
            });
            
            var mailOptions = {
                from: 'Game_Centre <dnflwlq3231@naver.com>',
                to: userEmail,
                subject: 'Your Password',
                text: 'Temporary password :\n\n       ' + randomPw + '\n   Please change your password! '
            };
            
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.log(error);
                }
                else {
                    console.log('Email sent!: ' + info.response);
                }
                transporter.close();
            
            });

            db.query('update user set user.password=? where user.id=?', [pbkdf2, userId], function(err2, data2){
                res.json({"msg" : "success"});
            });
        }
    })
})

router.get('/tt', function(req,res){
    res.render('tt');
})

router.get('/BlackJack', function (req, res) {
    if (req.session.loginId == undefined) {
        res.redirect('/login');
    }
    else next()
}, function (req, res) {
    res.render('game', {
        title: 'BlackJack',
        body: `
        <div>블랙잭</div>
        `
    })
})

router.get('/OddEven', function (req, res) {
    if (req.session.loginId == undefined) {
        res.redirect('/login');
    }
    else next()
}, function (req, res) {
    res.render('game', {
        title: 'OddEven',
        body: `
        <div>홀짝 맞추기</div>
        `
    })
})

router.get('/Dice', function (req, res) {
    if (req.session.loginId == undefined) {
        res.redirect('/login');
    }
    else next()
}, function (req, res) {
    res.render('game', {
        title: 'Dice',
        body: `
        <div>주사위 게임</div>
        `
    })
})

router.get('/Rps', function (req, res) {
    if (req.session.loginId == undefined) {
        res.redirect('/login');
    }
    else next()
}, function (req, res) {
    res.render('game', {
        title: 'Rock-Paper-Scissors',
        body: `
        <div>가위바위보 게임</div>
        `
    })
})

// web3를 이용해 컨트랙트와 통신하는 부분

router.post('/getToken', function (req, res) {
    if(typeof window.ethereum !== undefined) {
        ethereum.isMetaMask;
        ethereum.enable();
    }

    contract.methods.GetToken().call().then(console.log);
})


module.exports = router;