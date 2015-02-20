
var request = require('superagent');

var CommentModel = {
    url: 'json/comments.json',
    getAll: function(done) {
        return request(this.url)
            .end(function(err,data){
                if(data) {
                    done(err, data.body);
                }
            });
    }
};

module.exports = CommentModel;

