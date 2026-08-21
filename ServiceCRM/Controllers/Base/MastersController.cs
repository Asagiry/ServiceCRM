using Microsoft.AspNetCore.Mvc;
using ServiceCRM.Class;
using ServiceCRM.DTOs.MasterDTOs;
using ServiceCRM.Services.MasterServices;
using System.ComponentModel;

namespace ServiceCRM.Controllers.Base
{
    [ApiController]
    [Route("api/masters")]
    public class MastersController: ControllerBase
    {
        IMasterService _masterServise;
        public MastersController(IMasterService masterService)
        {
            _masterServise = masterService;
        }

        [HttpGet]
        [EndpointSummary("Получить список всех мастеров")]
        public async Task<ActionResult<List<Master>>> GetMasters(
            [FromQuery][Description("Получить список только {isActive} мастеров")]bool? isActive,
            [FromQuery][Description("Получить список тех у кого в {Fullname},{PhoneNumber}{City}{Telegram} находится {string}")]string? search,
            CancellationToken ct)
        {
            return Ok(await _masterServise.GetMastersAsync(isActive, search, ct));
        }

        [HttpGet("{id}")]
        [EndpointSummary("Получить мастера по Id с его заявками")]
        public async Task<ActionResult<Master?>> GetMasterById(
            [FromRoute][Description("Id искомого мастера")] int id,
            CancellationToken ct)
        {
            return Ok(await _masterServise.GetMasterByIdAsync(id, ct));
        }

        [HttpPost]
        [EndpointSummary("Создать мастера из dto")]
        public async Task<ActionResult<Master>> CreateMaster(
            [FromBody][Description("Dto мастера")]CreateMasterDto dto,
            CancellationToken ct)
        {
            Master master = await _masterServise.CreateMasterAsync(dto, ct);
            return CreatedAtAction(nameof(GetMasterById), new { id = master.Id }, master);
        }

        [HttpPut("{id}")]
        [EndpointSummary("Обновить мастера по id и dto")]
        public async Task<ActionResult<Master?>> UpdateMaster(
            [FromRoute][Description("Id обновляемого мастера")]int id,
            [FromBody][Description("Dto мастера")]UpdateMasterDto dto,
            CancellationToken ct)
            
        {
            return Ok(await _masterServise.UpdateMasterAsync(id, dto, ct));
        }

        [HttpDelete("{id}")]
        [EndpointSummary("Удалить мастера по id")]
        public async Task<ActionResult<Master?>> DeleteMaster(
            [FromRoute][Description("Id удаляемого мастера")] int id,
            CancellationToken ct)
        {
            return Ok(await _masterServise.DeleteMasterAsync(id, ct));
        }

        
    }
}
