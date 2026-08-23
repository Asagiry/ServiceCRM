using Microsoft.AspNetCore.Mvc;
using ServiceCRM.Common;
using ServiceCRM.DTOs.PaymentDTOs;
using ServiceCRM.DTOs.ServiceRequestDTOs;
using ServiceCRM.Models.Request;
using ServiceCRM.Services.PaymentServices;
using ServiceCRM.Services.ServiceRequestServices;
using System.ComponentModel;

namespace ServiceCRM.Controllers.Base
{
    [ApiController]
    [Route("api/requests")]
    public class ServiceRequestsController : ControllerBase
    {
        IServiceRequestService _serviceRequestService;
        IPaymentService _paymentService;
        public ServiceRequestsController(
            IServiceRequestService serviceRequestService,
            IPaymentService paymentService)
        {
            _serviceRequestService = serviceRequestService;
            _paymentService = paymentService;
        }



        [HttpGet]
        [EndpointSummary("Получить список заявок")]
        public async Task<ActionResult<PagedResult<ServiceRequestResponseDto>>> GetServiceRequests(
            [FromQuery][Description("Выбрать заявки только {Status}")] RequestStatus? status,
            [FromQuery][Description("Выбрать заявки только у мастера {masterId}")] int? masterId,
            [FromQuery][Description("Выбрать зявки созданные в {dateTime} день")] DateTime? dateTime,
            [FromQuery][Description("")] int page = 1,
            [FromQuery][Description] int pageSize = 20,
            CancellationToken ct = default
            )
        {
            return Ok(await _serviceRequestService.GetServiceRequestsAsync(status, masterId, dateTime, page, pageSize, ct));
        }

        [HttpGet("{id}")]
        [EndpointSummary("Получить заявку по {id}")]
        public async Task<ActionResult<ServiceRequestResponseDto>> GetServiceRequestById(
            [FromRoute][Description("Id искомой заявки")] int id,
            CancellationToken ct = default)
        {
            return Ok(await _serviceRequestService.GetServiceRequestByIdAsync(id, ct));
        }

        [HttpPost]
        [EndpointSummary("Создать заявку по dto")]
        public async Task<ActionResult<ServiceRequestResponseDto>> CreateServiceRequest(
            [FromBody][Description("dto новой заявки")] CreateServiceRequestDto dto,
            CancellationToken ct = default)
        {
            ServiceRequestResponseDto serviceRequest = await _serviceRequestService.CreateServiceRequestAsync(dto, ct);
            return CreatedAtAction(nameof(GetServiceRequestById), new { id = serviceRequest.Id }, serviceRequest);
        }

        [HttpPut("{id}")]
        [EndpointSummary("Обновить заявку по {id} и {dto}")]
        public async Task<ActionResult<ServiceRequestResponseDto>> UpdateServiceRequest(
            [FromRoute][Description("Id обновляемой заявки")]int id,
            [FromBody][Description("dto обновляемой заявки")]UpdateServiceRequestDto dto,
            CancellationToken ct = default)
        {
            return Ok(await _serviceRequestService.UpdateServiceRequestAsync(id, dto, ct));
        }

        [HttpPut("{id}/complete")]
        [EndpointSummary("Закрыть заявку по {id} и {dto}")]
        public async Task<ActionResult<ServiceRequestResponseDto>> CompleteServiceRequest(
            [FromRoute][Description("Id закрываемой заявки")]int id,
            [FromBody][Description("dto закрываемой заявки")]CompleteServiceRequestDto dto,
            CancellationToken ct = default)
        {
            return Ok(await _serviceRequestService.CompleteServiceRequestAsync(id, dto, ct));
        }

        [HttpDelete("{id}")]
        [EndpointSummary("Удалить заявку по {id]")]
        public async Task<ActionResult> DeleteServiceRequest(
            [FromRoute][Description("Id удаляемой заявки")]int id,
            CancellationToken ct = default)
        {
            await _serviceRequestService.DeleteServiceRequestAsync(id, ct);
            return NoContent();
        }

        #region Payments

        [HttpGet("{requestId}/payments")]
        [EndpointSummary("Получить платеж по {id} заявки")]
        public async Task<ActionResult<PaymentResponseDto>> GetPaymentByServiceRequestId(
            [FromRoute][Description("Id заявки")]int requestId,
            CancellationToken ct)
        {
            return Ok(await _paymentService.GetPaymentByServiceRequestIdAsync(requestId, ct));
        }

        [HttpPost("{requestId}/payments")]
        [EndpointSummary("Создать платеж на заявку по {id}")]
        public async Task<ActionResult<PaymentResponseDto>> CreatePaymentByServiceRequestId(
            [FromRoute][Description("Id Заявки")]int requestId,
            [FromBody][Description("Dto платежа")]CreatePaymentDto dto,
            CancellationToken ct)
        {
            PaymentResponseDto payment = await _paymentService.CreatePaymentByServiceRequestIdAsync(requestId, dto, ct);
            return CreatedAtAction(nameof(GetPaymentByServiceRequestId), new { requestId = payment.ServiceRequestId }, payment);
        }

        #endregion

    }
}
