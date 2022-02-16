class CreateError {
    constructor(
        _title = "Internal Service Error",
        _code = 500,
        _type = '',
        _message = 'Something bad has been occured',
        _detail = ''
    ) {
        this.title = _title,
        this.code = _code,
        this.message = _message,
        this.detail = _detail
    }
}

class CreateRespond {
    constructor(_status, _type, _data) {
        this.status = _status,
        this.type = _type,
        this.data = _data
    }
}

const UrlLogger = (req, res, next) => {
    console.log(`${req.method} : ${req.url}`);
    next();
}

module.exports = { CreateError, CreateRespond, UrlLogger }