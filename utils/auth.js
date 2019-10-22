module.exports = {
    isOwner:function(req, res) {
        if (req.session.user.isLogined) {
            return true;
        } else if(!req.session.user.isLogined || req.session.user.isLogined == undefined){
            return false;
        }
    },
    
    statusUI:function(req, res) {
        let authStatusUI = `<a class="nav-link py-3 px-0 px-lg-3 rounded js-scroll-trigger" onclick="signStatus(0)" href='/login'
        id="notyet">LOGIN</a>`
        if (this.isOwner(req, res)) {
            authStatusUI = `<a class="nav-link py-3 px-0 px-lg-3 rounded js-scroll-trigger" href='/logout' id="checkout">LOGOUT</a>`;
        }
        return authStatusUI;
    }
  }