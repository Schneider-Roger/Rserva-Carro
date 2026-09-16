import { ApiError } from '../utils/ApiError.js';
import { getTenantContext } from '../repositories/tenant.repository.js';

export async function getContext(req) {
  const raw = await getTenantContext(req.tenant.empresaId, req.user.id);
  if (!raw.user) throw new ApiError(401, 'USUARIO_NAO_ENCONTRADO', 'O usuário autenticado não está ativo nesta empresa.');

  return {
    user: {
      id: raw.user.id,
      employeeCode: raw.user.codigo_funcionario,
      name: raw.user.nome,
      firstName: raw.user.nome.split(/\s+/)[0],
      email: raw.user.email,
      phone: raw.user.telefone,
      unit: raw.user.unidade_id ? { id: raw.user.unidade_id, name: raw.user.unidade_nome } : null,
      department: raw.user.departamento_id ? { id: raw.user.departamento_id, name: raw.user.departamento_nome } : null,
      roles: req.user.roles || [],
      permissions: req.user.permissions || [],
    },
    settings: {
      timezone: raw.settings.timezone,
      reservationIntervalMinutes: Number(raw.settings.intervalo_reserva_minutos),
      minimumLeadMinutes: Number(raw.settings.antecedencia_minima_minutos),
      cancellationLeadMinutes: Number(raw.settings.antecedencia_cancelamento_minutos),
      maxDestinations: Number(raw.settings.max_destinos),
      allowDifferentDriver: Boolean(raw.settings.permite_motorista_diferente),
      requireTicket: Boolean(raw.settings.exige_numero_chamado),
      requireCostCenter: Boolean(raw.settings.exige_centro_custo),
      allowReservationEdit: Boolean(raw.settings.permite_edicao_reserva),
      allowReservationCancellation: Boolean(raw.settings.permite_cancelamento),
    },
    branding: {
      productName: raw.branding?.nome_produto || 'Frota Leve',
      logoUrl: raw.branding?.logo_url || null,
      faviconUrl: raw.branding?.favicon_url || null,
      primaryColor: raw.branding?.cor_primaria || '#0B6B3A',
      secondaryColor: raw.branding?.cor_secundaria || '#0C2F21',
      supportEmail: raw.branding?.email_suporte || null,
      showPlatformBrand: raw.branding ? Boolean(raw.branding.exibir_marca_plataforma) : true,
    },
  };
}
