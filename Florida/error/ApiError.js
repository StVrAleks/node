class ApiError{
constructor(status, mes){
    //super()
    this.status = status
    this.mes = mes
}
    static badRequest(mes){
        return new ApiError(404, mes);
    }
    static internal(mes){
        return new ApiError(500, mes);
    }
    static forbiden(mes){
        return new ApiError(403, mes);
    }
}
module.exports = ApiError;