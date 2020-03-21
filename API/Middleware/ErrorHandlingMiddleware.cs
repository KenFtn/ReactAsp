using System;
using System.Net;
using System.Text.Json;
using System.Threading.Tasks;
using Application.Errors;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;

namespace API.Middleware
{
    public class ErrorHandlingMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<ErrorHandlingMiddleware> _logger;
        public ErrorHandlingMiddleware(RequestDelegate next, ILogger<ErrorHandlingMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task Invoke(HttpContext context)
        {
            try 
            {
                await _next(context);
            }
            catch(Exception ex) 
            {
                await HandleExceptionAsync(context, ex, _logger);
            }
        }

        private async Task HandleExceptionAsync(HttpContext context, Exception ex, ILogger<ErrorHandlingMiddleware> logger)
        {
            object errors = null;

            switch(ex)
            {
                case RestException re : //RestException viens de Application / Errors
                    logger.LogError(ex, "Rest Error");
                    errors = re.Errors; // J'attribut le message d'erreur de ex à mon objet RestException
                    context.Response.StatusCode = (int)re.Code; // J'attribue le code Http de la réponse à mon objet. Ses infos me permettrons de passer de mon middleware vers mon controller.
                    break;
                case Exception e : 
                    logger.LogError(ex, "Server Error"); // permet de log les erreurs.
                    errors = string.IsNullOrWhiteSpace(e.Message) ? "Error" : e.Message; // c'est une ternaire. Si c'est whiteSpace, alors je met juste Error, sinon je met le message d'erreur
                    context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;
                    break;
            }

            context.Response.ContentType = "application/json";
            if (errors != null)
            {
                var result = JsonSerializer.Serialize(new 
                {
                    errors    
                });

                await context.Response.WriteAsync(result);
            }
        }
    }
}