class ApiFeatures {
  constructor(mongooseQuery, queryString) {
    this.mongooseQuery = mongooseQuery;
    this.queryString = queryString;
  }

  //1-filltering
  filter() {
    let filter = { ...this.queryString };
    const excludeQuery = ['page', 'sort', 'fileds', 'keyword'];
    excludeQuery.forEach((elem) => delete filter[elem]);
    //advanced filtering

    filter = JSON.stringify(filter);
    filter = filter.replace(/\b(gte|gt|lt|lte)\b/g, (match) => `$${match}`);

    this.mongooseQuery = this.mongooseQuery.find(JSON.parse(filter));
    return this;
  }
  //2-pagination
  paginate() {
    let page = this.queryString?.page * 1 || 1;
    let limit = this.queryString?.limit * 1 || 50;
    let skip = (page - 1) * limit;

    if (page < 0) {
      page = 1;
      skip = 0;
    }
    this.mongooseQuery = this.mongooseQuery.skip(skip).limit(limit);
    return this;
  }

  //3-sorting
  sorting() {
    if (this.queryString?.sort) {
      let sortedBy = this.queryString.sort.split(',').join(' ');
      this.mongooseQuery = this.mongooseQuery.sort(sortedBy);
    } else {
      this.mongooseQuery = this.mongooseQuery.sort('-createdAt');
    }
    return this;
  }
  //4-fieldes
  limitingFields() {
    if (this.queryString?.field) {
      let filedes = this.queryString?.field.split(',').join(' ');
      this.mongooseQuery.select(filedes);
    } else {
      this.mongooseQuery.select('-__v');
    }
    return this;
  }
  //5-search
  search(fields = ['name', 'description']) {
    if (this.queryString?.keyword && fields.length > 0) {
      const keyword = this.queryString.keyword;

      const orConditions = fields.map(field => ({
        [field]: { $regex: keyword, $options: 'i' }
      }));

      this.mongooseQuery = this.mongooseQuery.find({ $or: orConditions });
    }
    return this;
  }
  async calculatePaginationInfo() {
    const totalDocs = await this.mongooseQuery.model.countDocuments(this.mongooseQuery.getQuery());
    const page = this.queryString?.page * 1 || 1;
    const limit = this.queryString?.limit ? this.queryString.limit * 1 : 10;
    const totalPages = Math.ceil(totalDocs / limit);

    return {
      totalDocs,
      totalPages,
      currentPage: page,
      limit
    };
  }
}

export default ApiFeatures;
