var mongodb = require('./db');

function News(news) {
    this.category = news.category;
    this.title=news.title;
    this.label = news.label;
    this.img = news.img;
};

module.exports = News;

//存储新闻信息
News.prototype.save = function(callback) {
    var date = new Date();
    //存储各种时间格式，方便以后扩展
    var time = {
        date: date,
        year : date.getFullYear(),
        month : date.getFullYear() + "-" + (date.getMonth() + 1),
        day : date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate(),
        minute : date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " +
        date.getHours() + ":" + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes())
    }
    //要存入数据库的文档
    var news = {
        category: this.category,
        title:this.title,
        label: this.label,
        img:this.img,
        time: time
    };
    //打开数据库
    mongodb.open(function (err, db) {
        if (err) {
            return callback(err);
        }
        //读取 news 集合
        db.collection('news', function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            //将文档插入 news 集合
            collection.insert(news, {
                safe: true
            }, function (err) {
                mongodb.close();
                if (err) {
                    return callback(err);//失败！返回 err
                }
                callback(null);//返回 err 为 null
            });
        });
    });
};

//根据新闻种类读取新闻信息
News.get = function(category,callback) {
    //打开数据库
    mongodb.open(function (err, db) {
        if (err) {
            return callback(err);//错误，返回 err 信息
        }
        //读取 news 集合
        db.collection('news', function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);//错误，返回 err 信息
            }
            //查找所对应新闻种类的文档
            query={}
            if(category){
                query.category=category;
            }
            collection.find(query).sort({
                time: -1
            }).toArray(function (err, docs) {
                mongodb.close();
                if (err) {
                    return callback(err);
                }
                callback(null, docs);
            });
        });
    });
};

//删除一篇文章
News.remove = function(id, callback) {
    //打开数据库
    mongodb.open(function (err, db) {
        if (err) {
            return callback(err);
        }
        //读取 news 集合
         var ObjectID = require('mongodb').ObjectID;
        db.collection('news', function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            //根据id查找并删除一篇文章
           collection.remove({
               _id:new ObjectID(id)
           },function (err) {
                mongodb.close();
                if (err) {
                    return callback(err);
                }
                callback(null);
            });
        });
    });
};

//获取一则新闻信息
News.getOne = function(id, callback) {
    //打开数据库
    mongodb.open(function (err, db) {
        if (err) {
            return callback(err);
        }
        //读取 news 集合
        db.collection('news', function (err, collection) {

            if (err) {
                mongodb.close();
                return callback(err);
            }
            //根据id进行查询
            var ObjectID = require('mongodb').ObjectID;
            collection.findOne({

                "_id": new ObjectID(id)

            }, function (err, doc) {
                mongodb.close();
                if (err) {
                    return callback(err);
                }
                callback(null, doc);//返回查询的一则新闻
            });
        });
    });
};

//更新一篇文章及其相关信息
News.update = function(id,news,callback) {
    //打开数据库
    mongodb.open(function (err, db) {
        if (err) {
            return callback(err);
        }
        //读取news集合
        db.collection('news', function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            //更新文章内容
            var ObjectID = require('mongodb').ObjectID;
            collection.update({

                "_id": new ObjectID(id)

            }, {
                $set: {
                    category:news.category,
                    title:news.title,
                    label:news.label,
                    img:news.img
                }
            }, function (err) {
                mongodb.close();
                if (err) {
                    return callback(err);
                }
                callback(null);
            });
        });
    });
};



