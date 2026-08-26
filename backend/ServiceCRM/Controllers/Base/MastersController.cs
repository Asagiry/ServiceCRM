using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ServiceCRM.Common;
using ServiceCRM.DTOs.MasterDTOs;
using ServiceCRM.Models;
using ServiceCRM.Services.MasterServices;
using System.ComponentModel;

namespace ServiceCRM.Controllers.Base
{
    [ApiController]
    [Authorize(Roles = Roles.Admin)]
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
        public async Task<ActionResult<PagedResult<MasterResponseDto>>> GetMasters(
            [FromQuery][Description("Получить список только {isActive} мастеров")]bool? isActive,
            [FromQuery][Description("Получить список тех у кого в {Fullname},{PhoneNumber}{City}{Telegram} находится {string}")]string? search,
            [FromQuery][Description]int page = 1,
            [FromQuery][Description]int pageSize = 20,
            CancellationToken ct = default)
        {
            return Ok(await _masterServise.GetMastersAsync(isActive, search, page, pageSize, ct));
        }

        [HttpGet("{id}")]
        [EndpointSummary("Получить мастера по Id с его заявками")]
        public async Task<ActionResult<MasterDetailedResponseDto>> GetMasterById(
            [FromRoute][Description("Id искомого мастера")] int id,
            CancellationToken ct)
        {
            return Ok(await _masterServise.GetMasterByIdAsync(id, ct));
        }

        [HttpPost]
        [EndpointSummary("Создать мастера из dto")]
        public async Task<ActionResult<MasterResponseDto>> CreateMaster(
            [FromBody][Description("Dto мастера")]CreateMasterDto dto,
            CancellationToken ct)
        {
            MasterResponseDto master = await _masterServise.CreateMasterAsync(dto, ct);
            return CreatedAtAction(nameof(GetMasterById), new { id = master.Id }, master);
        }

        [HttpPut("{id}")]
        [EndpointSummary("Обновить мастера по id и dto")]
        public async Task<ActionResult<MasterResponseDto>> UpdateMaster(
            [FromRoute][Description("Id обновляемого мастера")]int id,
            [FromBody][Description("Dto мастера")]UpdateMasterDto dto,
            CancellationToken ct)
            
        {
            return Ok(await _masterServise.UpdateMasterAsync(id, dto, ct));
        }

        [HttpDelete("{id}")]
        [EndpointSummary("Удалить мастера по id")]
        public async Task<ActionResult> DeleteMaster(
            [FromRoute][Description("Id удаляемого мастера")] int id,
            CancellationToken ct)
        {
            await _masterServise.DeleteMasterAsync(id, ct);
            return NoContent();
        }

        
    }
}
