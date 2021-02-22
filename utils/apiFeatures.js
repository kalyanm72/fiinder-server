

module.exports = class ApiFeatures{
    constructor(query,queryStr){
        this.query=query;
        this.queryStr=queryStr;
    }

    filter(){

        const queryObj={...this.queryStr};
        const excludefields=['sort','page','limit','fields'];

        excludefields.forEach(element => {
            delete queryObj[element]
        });

        const queryStr=JSON.stringify(queryObj).replace(/\b(gte|lte|lt|gt)\b/g,(match)=>`$${match}`);

        this.query=this.query.find(JSON.parse(queryStr));

        return this;
    }

    paginate(){
        
        // *1 as to convert into integer type
        const page=this.queryStr.page*1||1;
        const limit=this.queryStr.limit*1||100;
        const skip=(page-1)*limit;

        this.query=this.query.skip(skip).limit(limit);

        return this;
    }   

    sort(){

        let sortBy = '-createdAt';

        if(this.queryStr.sort)
        sortBy = this.queryStr.sort.split(',').join(' ');

        this.query=this.query.sort(sortBy);

        return this;
    }

    limit(){
        let fields='-__v';

        if(this.queryStr.fields)
        fields = JSON.stringify(this.queryStr.fields).split(',').join(' ');

        this.query.select(fields);
        
        return this;

    }
}