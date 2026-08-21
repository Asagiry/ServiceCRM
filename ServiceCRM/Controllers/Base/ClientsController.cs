using Microsoft.AspNetCore.Mvc;
using ServiceCRM.Class;
using ServiceCRM.DTOs.ClientDTOs;
using System.ComponentModel;

namespace ServiceCRM.Controllers.Base
{
    [ApiController]
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
        public async Task<ActionResult<List<Client>>> GetClients(
            [FromQuery][Description("найти клиентов у которых есть {search} в FullName,PhoneNumber,City")] string? search,
            CancellationToken ct)
        {
            return Ok(await _clientService.GetClientsAsync(search, ct));
        }

        [HttpGet("{id}")]
        [EndpointSummary("Получить клиента по Id с его заявками")]
        public async Task<ActionResult<Client>> GetClientById(
            [FromRoute][Description("Id искомого клиента")] int id,
            CancellationToken ct)
        {
            var client = await _clientService.GetClientByIdAsync(id, ct);

            if (client != null)
                return Ok(client);
            else
                return NotFound();
        }

        [HttpPost]
        [EndpointSummary("Создать нового клиента")]
        public async Task<ActionResult<Client>> CreateClient(
            [FromBody][Description("Dto клиента")] CreateClientDto dto,
            CancellationToken ct)
        {
            Client client = await _clientService.CreateClientAsync(dto, ct);

            return CreatedAtAction(nameof(GetClientById), new { id = client.Id }, client);
        }

        [HttpPut("{id}")]
        [EndpointSummary("Обновить клиента по Id")]
        public async Task<ActionResult<Client>> UpdateCliend(
           [FromRoute][Description("Id клиента")] int id,
           [FromBody][Description("Dto клиента")] UpdateClientDto dto,
           CancellationToken ct)
        {
            Client? client = await _clientService.UpdateClientAsync(id, dto, ct);
            if (client != null)
            {
                return Ok(client);
            }
            else
            {
                return NotFound();
            }
        }

        [HttpDelete("{id}")]
        [EndpointSummary("Удалить клиента по Id")]
        public async Task<ActionResult> DeleteClient(
            [FromRoute][Description("Id удаляемого клиента")] int id,
            CancellationToken ct)
        {
            Client? client = await _clientService.DeleteClientAsync(id, ct);

            if (client != null)
                return Ok(client);
            else
                return NotFound();
        }

    }
}
