using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ServiceCRM.Common;
using ServiceCRM.DTOs.ClientDTOs;
using ServiceCRM.Services.ClientServices;
using System.ComponentModel;

namespace ServiceCRM.Controllers.Base
{
    [ApiController]
    [Authorize(Roles = Roles.Admin)]
    [Route("api/clients")]
    public class ClientsController : ControllerBase
    {
        IClientService _clientService;
        public ClientsController(IClientService clientService)
        {
            _clientService = clientService;
        }

        [HttpGet]
        [EndpointSummary("Получить список всех клиентов")]
        public async Task<ActionResult<PagedResult<ClientResponseDto>>> GetClients(
            [FromQuery][Description("найти клиентов у которых есть {search} в FullName,PhoneNumber,City")] string? search,
            [FromQuery][Description("Страница списка клиентов")]int page = 1,
            [FromQuery][Description("Количество клиентов на странице")]int pageSize = 20,
            CancellationToken ct = default)
        {
            return Ok(await _clientService.GetClientsAsync(search, page, pageSize, ct));
        }

        [HttpGet("{id}")]
        [EndpointSummary("Получить клиента по Id с его заявками")]
        public async Task<ActionResult<ClientDetailedResponseDto>> GetClientById(
            [FromRoute][Description("Id искомого клиента")] int id,
            CancellationToken ct = default)
        {
            return Ok(await _clientService.GetClientByIdAsync(id, ct));
        }

        [HttpPost]
        [EndpointSummary("Создать нового клиента")]
        public async Task<ActionResult<ClientResponseDto>> CreateClient(
            [FromBody][Description("Dto клиента")] CreateClientDto dto,
            CancellationToken ct = default)
        {
            ClientResponseDto client = await _clientService.CreateClientAsync(dto, ct);

            return CreatedAtAction(nameof(GetClientById), new { id = client.Id }, client);
        }

        [HttpPut("{id}")]
        [EndpointSummary("Обновить клиента по Id")]
        public async Task<ActionResult<ClientResponseDto>> UpdateCliend(
           [FromRoute][Description("Id клиента")] int id,
           [FromBody][Description("Dto клиента")] UpdateClientDto dto,
           CancellationToken ct = default)
        {      
            return Ok(await _clientService.UpdateClientAsync(id, dto, ct));
        }

        [HttpDelete("{id}")]
        [EndpointSummary("Удалить клиента по Id")]
        public async Task<ActionResult> DeleteClient(
            [FromRoute][Description("Id удаляемого клиента")] int id,
            CancellationToken ct = default)
        {
            await _clientService.DeleteClientAsync(id, ct);
            return NoContent();
        }

    }
}
