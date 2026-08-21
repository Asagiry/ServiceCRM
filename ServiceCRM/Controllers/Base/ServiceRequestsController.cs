using Microsoft.AspNetCore.Mvc;
using ServiceCRM.Class;
using ServiceCRM.DTOs.ServiceRequestDTOs;
using ServiceCRM.Services.ServiceRequestServices;
using System.ComponentModel;

namespace ServiceCRM.Controllers.Base
{
    [ApiController]
    [Route("api/requests")]
    public class ServiceRequestsController : ControllerBase
    {
        IServiceRequestService _serviceRequestService;
        public ServiceRequestsController(IServiceRequestService serviceRequestService)
        {
            _serviceRequestService = serviceRequestService;
        }



        [HttpGet]
        [EndpointSummary("Получить список заявок")]
        public async Task<ActionResult<List<ServiceRequest>>> GetServiceRequests(
            [FromQuery][Description("Выбрать заявки только {Status}")] RequestStatus? status,
            [FromQuery][Description("Выбрать заявки только у мастера {masterId}")] int? masterId,
            [FromQuery][Description("Выбрать зявки созданные в {dateTime} день")] DateTime? dateTime,
            CancellationToken ct
            )
        {
            return Ok(await _serviceRequestService.GetServiceRequestsAsync(status, masterId, dateTime, ct));
        }

        [HttpGet("{id}")]
        [EndpointSummary("Получить заявку по {id}")]
        public async Task<ActionResult<ServiceRequest>> GetServiceRequestById(
            [FromRoute][Description("Id искомой заявки")] int id,
            CancellationToken ct)
        {
            ServiceRequest? serviceRequest = await _serviceRequestService.GetServiceRequestByIdAsync(id, ct);

            if (serviceRequest != null)
            {
                return Ok(serviceRequest);
            }
            else
            {
                return NotFound();
            }
        }

        [HttpPost]
        [EndpointSummary("Создать заявку по dto")]
        public async Task<ActionResult<ServiceRequest>> CreateServiceRequest(
            [FromBody][Description("dto новой заявки")] CreateServiceRequestDto dto,
            CancellationToken ct)
        {
            ServiceRequest serviceRequest = await _serviceRequestService.CreateServiceRequestAsync(dto, ct);
            return CreatedAtAction(nameof(GetServiceRequestById), new { id = serviceRequest.Id }, serviceRequest);
        }

        [HttpPut("{id}")]
        [EndpointSummary("Обновить заявку по {id} и {dto}")]
        public async Task<ActionResult<ServiceRequest>> UpdateServiceRequest(
            [FromRoute][Description("Id обновляемой заявки")]int id,
            [FromBody][Description("dto обновляемой заявки")]UpdateServiceRequestDto dto,
            CancellationToken ct)
        {
            return Ok(await _serviceRequestService.UpdateServiceRequestAsync(id, dto, ct));
        }

        [HttpPut("{id}/complete")]
        [EndpointSummary("Закрыть заявку по {id} и {dto}")]
        public async Task<ActionResult<ServiceRequest>> CompleteServiceRequest(
            [FromRoute][Description("Id закрываемой заявки")]int id,
            [FromBody][Description("dto закрываемой заявки")]CompleteServiceRequestDto dto,
            CancellationToken ct)
        {
            return Ok(await _serviceRequestService.CompleteServiceRequestAsync(id, dto, ct));
        }

        [HttpDelete("{id}")]
        [EndpointSummary("Удалить заявку по {id]")]
        public async Task<ActionResult> DeleteServiceRequest(
            [FromRoute][Description("Id удаляемой заявки")]int id,
            CancellationToken ct)
        {
            ServiceRequest? serviceRequest = await _serviceRequestService.DeleteServiceRequestAsync(id, ct);

            if (serviceRequest != null)
            {
                return Ok(serviceRequest);
            }
            else
            {
                return NotFound(serviceRequest);
            }
        }


    }
}
