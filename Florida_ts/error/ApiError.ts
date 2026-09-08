class ApiError{
    status!:number;
    mes!:string;   

constructor(status:number, mes:string){
    this.status = status
    this.mes = mes
}
    static badRequest(mes:string){
        return new ApiError(400, mes);
    }
    static internal(mes:string){
        return new ApiError(500, mes);
    }
    static notFound(mes: string) { 
        return new ApiError(404, mes);
    }    
    static forbidden(mes:string){
        return new ApiError(403, mes);
    }
}

export default ApiError;