'use strict';

var React = require('react');
var CommentModel = require('./models');


var CommentList = React.createClass({
    render: function() {
        var commentElement = this.props.comments.map(function(comment, index){
            var key = "comment " + index;
            return (
                <Comment author={comment.author} key={key}>{comment.comment}</Comment>
            )
        });
        return (
            <div className='commentList'>
                {commentElement}
            </div>
        )
    }
});


var CommentBox = React.createClass({
    getInitialState: function() {
        return {
            comments: []
        }
    },
    componentDidMount: function() {
        this.request = CommentModel.getAll(function(err, data){
            this.setState({comments: data});
        }.bind(this));
    },
    componentWillUnmount: function() {
        console.log("Comp unmounting...");
        this.request.abort();
    },
    handleFormSubmit: function(data) {
        var comments = this.state.comments;
        comments.push(data);
        this.setState({comments:comments.reverse()});
    },
    render: function() {
        return (
            <div className='commentBox'>
                <h1>Comments</h1>
                <CommentList comments={this.state.comments}/>
                <CommentForm onCommentSubmit={this.handleFormSubmit}/>
            </div>
        );
    }

});

var Comment = React.createClass({
    render: function() {
        return(
            <div className='comment'>
                <h2 className='commentAuthor'>
                    {this.props.author}
                </h2>
                {this.props.children}
            </div>
        );
    }
});


var CommentForm = React.createClass({
    handleSubmit: function(e) {
        e.preventDefault();
        var author =  this.refs.author.getDOMNode().value.trim();
        var comment = this.refs.comment.getDOMNode().value.trim();
        if (!comment || !author) {
            return;
        }
        this.props.onCommentSubmit({author:author,comment:comment});
        this.refs.author.getDOMNode().value = '';
        this.refs.comment.getDOMNode().value = '';
    },
    render: function() {
        return (
            <div className='col-md-6'>
                <form className='commentForm form' onSubmit={this.handleSubmit}>
                    <div className='form-group'>
                    <input className='form-control' type='text' placeholder='Your name' ref='author'/>
                    </div>
                    <div className='form-group'>
                    <input className='form-control' type='text' placeholder='Say Something' ref='comment'/>
                    </div>
                    <input type='submit' value='Post' />
                </form>
            </div>
        )
    }
});

module.exports = CommentBox;