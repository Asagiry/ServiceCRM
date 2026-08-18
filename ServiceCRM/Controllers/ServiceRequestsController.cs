using Microsoft.AspNetCore.Mvc;
using ServiceCRM.Class;
using ServiceCRM.DTOs.ServiceRequestDTOs;
using ServiceCRM.Services.ServiceRequestServices;
using System.ComponentModel;

namespace ServiceCRM.Controllers
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
            [FromQuery][Description("Выбрать зявки созданные в {dateTime} день")] DateTime? dateTime
            )
        {
            return Ok(await _serviceRequestService.GetServiceRequestsAsync(status, masterId, dateTime));
        }

        [HttpGet("{id}")]
        [EndpointSummary("Получить заявку по {id}")]
        public async Task<ActionResult<ServiceRequest>> GetServiceRequestById(
            [FromRoute][Description("Id искомой заявки")] int id)
        {
            ServiceRequest? serviceRequest = await _serviceRequestService.GetServiceRequestByIdAsync(id);

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
            [FromBody][Description("dto новой заявки")] CreateServiceRequestDto dto)
        {
            ServiceRequest serviceRequest = await _serviceRequestService.CreateServiceRequestAsync(dto);
            return CreatedAtAction(nameof(GetServiceRequestById), new { id = serviceRequest.Id }, serviceRequest);
        }

        [HttpPut("{id}")]
        [EndpointSummary("Обновить заявку по {id} и {dto}")]
        public async Task<ActionResult<ServiceRequest>> UpdateServiceRequest(
            [FromRoute][Description("Id обновляемой заявки")]int id,
            [FromBody][Description("dto обновляемой заявки")]UpdateServiceRequestDto dto)
        {
            return Ok(await _serviceRequestService.UpdateServiceRequestAsync(id, dto));
        }

        [HttpPut("{id}/complete")]
        [EndpointSummary("Закрыть заявку по {id} и {dto}")]
        public async Task<ActionResult<ServiceRequest>> CompleteServiceRequest(
            [FromRoute][Description("Id закрываемой заявки")]int id,
            [FromBody][Description("dto закрываемой заявки")]CompleteServiceRequestDto dto)
        {
            return Ok(await _serviceRequestService.CompleteServiceRequestAsync(id, dto));
        }

        [HttpDelete("{id}")]
        [EndpointSummary("Удалить заявку по {id]")]
        public async Task<ActionResult> DeleteServiceRequest(
            [FromRoute][Description("Id удаляемой заявки")]int id)
        {
            ServiceRequest? serviceRequest = await _serviceRequestService.DeleteServiceRequestAsync(id);

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
