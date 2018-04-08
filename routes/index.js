var router = require('koa-router')();
var persion = require('../data/persion');
var spideryehu = require('../server/spideryehu');

router.get('/', function *(next) {
  yield this.render('index', {
    persion: persion,
    info: '',
  });
});

router.get('/spider', function *(next) {
  var info = "批量导出成功！";
  var query = this.query;
  var name = query.name;
  var sname = query.sname;
  var startdate = query.startdate;
  var enddate = query.enddate;
  if( name.length === 0 && sname.length === 0 ) {
      info = "填写棋手名或选择棋手";
      yield this.render('index', {
        persion: persion,
        info: info
      });
  }

  if( name.length === 0 && sname.length > 0 ) {
      name = sname;
  }

  info = yield spideryehu(name,startdate,enddate);
  
  yield this.render('index', {
    persion: persion,
    info: info
  });
});

module.exports = router;
