const moment = require('moment');

moment.locale('zh-cn');

module.exports = {
  WEEKDAY_FRIST: moment().weekday(0),
  WEEKDAY_LAST: moment().weekday(6),
  SEVEN_DAYS_AGO: moment()
    .subtract(7, 'd')
    .format('YYYY-MM-DD'),
  CURRENT_DATE: moment(),
};
