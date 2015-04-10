module.exports = {
    'provinces': function(req,res){//首页默认模板
        res.send({
            data:[
                {
                    id: 1,
                    name: '上海'
                },
                {
                    id: 2,
                    name: '北京'
                }
            ]
        });
    },
    'cities': function(req,res){//首页默认模板
        res.send({
            data:[
                {
                    id: 11,
                    name: '上海',
                    provinceId: 1
                }
            ]
        });
    },
    'counties': function(req,res){
        res.send({
            data:[
                {
                    id: 111,
                    name: '徐汇区',
                    cityId: 11
                },
                {
                    id: 222,
                    name: '长宁',
                    cityId: 11
                }
            ]
        });
    },
    'postUsers': function(req,res) {console.log('success')
        res.send({
            status: "success"
        });
    },
    'list': function (req, res) {  //活动列表
        console.log(req.query.id)
        if(req.query.id) {
            res.send(
                {
                    "id": 1,
                    "name": 'user',
                    "card": 12323,
                    "provinceId": 1,
                    "cityId": 11,
                    "countyId": 111,
                    "companyName": "stars",
                    "createdTime": "2013-10-30 16:29:09",
                    "phone": "B1",
                    "address": "STANDARD",
                    "start": "2013-10-30 16:29:09",
                    "end": "2013-10-30 16:29:09",
                    "join": "2013-10-30 16:29:09",
                    "price": "200",
                    "number": 1
                }
            )
        }else{

            res.send({
                "total": 7,
                "page": 1,
                "pageSize": 20,
                "data": [
                    {
                        "id": 1,
                        "name": 'user',
                        "companyName": "stars",
                        "createdTime": "2013-10-30 16:29:09",
                        "phone": "B1",
                        "address": "STANDARD",
                        "start": "2013-10-30 16:29:09",
                        "end": "2013-10-30 16:29:09",
                        "join": "2013-10-30 16:29:09",
                        "price": "200",
                        "number": 1
                    },
                    {
                        "id":2,
                        "name": 'user',
                        "companyName": "stars",
                        "createdTime": "2013-10-30 16:29:09",
                        "phone": "B1",
                        "address": "STANDARD",
                        "start": "2013-10-30 16:29:09",
                        "end": "2013-10-30 16:29:09",
                        "join": "2013-10-30 16:29:09",
                        "price": "200",
                        "number": 1
                    },
                    {
                        "name": 'user',
                        "companyName": "stars",
                        "createdTime": "2013-10-30 16:29:09",
                        "phone": "B1",
                        "address": "STANDARD",
                        "start": "2013-10-30 16:29:09",
                        "end": "2013-10-30 16:29:09",
                        "join": "2013-10-30 16:29:09",
                        "price": "200",
                        "number": 1
                    },
                    {
                        "name": 'user',
                        "companyName": "stars",
                        "createdTime": "2013-10-30 16:29:09",
                        "phone": "B1",
                        "address": "STANDARD",
                        "start": "2013-10-30 16:29:09",
                        "end": "2013-10-30 16:29:09",
                        "join": "2013-10-30 16:29:09",
                        "price": "200",
                        "number": 1
                    },
                    {
                        "name": 'user',
                        "companyName": "stars",
                        "createdTime": "2013-10-30 16:29:09",
                        "phone": "B1",
                        "address": "STANDARD",
                        "start": "2013-10-30 16:29:09",
                        "end": "2013-10-30 16:29:09",
                        "join": "2013-10-30 16:29:09",
                        "price": "200",
                        "number": 1
                    }
                ]
            });
        }
}
}