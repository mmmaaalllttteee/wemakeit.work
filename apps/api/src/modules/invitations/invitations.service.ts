import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Invitation } from './entities/invitation.entity';
import {
  CreateInvitationDto,
  AcceptInvitationDto,
  ResendInvitationDto,
} from './dto/invitation.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class InvitationsService {
  constructor(
    @InjectRepository(Invitation)
    private invitationRepository: Repository<Invitation>,
  ) {}

  /**
   * Create a new invitation
   */
  async createInvitation(
    dto: CreateInvitationDto,
    invitedBy: string,
    orgId: string,
  ): Promise<Invitation> {
    // Check for existing pending invitation
    const existingInvitation = await this.invitationRepository.findOne({
      where: {
        email: dto.email,
        orgId,
        status: 'pending',
      },
    });

    if (existingInvitation) {
      throw new BadRequestException('An invitation for this email already exists');
    }

    // Generate unique token
    const token = uuidv4();

    // Set expiration (7 days from now)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const invitation = this.invitationRepository.create({
      ...dto,
      orgId,
      token,
      expiresAt,
      invitedBy,
      status: 'pending',
    });

    const savedInvitation = await this.invitationRepository.save(invitation);

    // TODO: Send email notification
    // await this.sendInvitationEmail(savedInvitation);

    return savedInvitation;
  }

  /**
   * Get all invitations for an organization
   */
  async getInvitations(orgId: string, status?: string): Promise<Invitation[]> {
    const where: any = { orgId };
    if (status) {
      where.status = status;
    }

    return this.invitationRepository.find({
      where,
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Get invitation by ID
   */
  async getInvitation(id: string, orgId: string): Promise<Invitation> {
    const invitation = await this.invitationRepository.findOne({
      where: { id, orgId },
    });

    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    return invitation;
  }

  /**
   * Get invitation by token (for acceptance)
   */
  async getInvitationByToken(token: string): Promise<Invitation> {
    const invitation = await this.invitationRepository.findOne({
      where: { token },
      relations: ['organization'],
    });

    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    if (invitation.status !== 'pending') {
      throw new BadRequestException(`Invitation is ${invitation.status}`);
    }

    if (new Date() > invitation.expiresAt) {
      invitation.status = 'expired';
      await this.invitationRepository.save(invitation);
      throw new BadRequestException('Invitation has expired');
    }

    return invitation;
  }

  /**
   * Resend invitation email
   */
  async resendInvitation(id: string, dto: ResendInvitationDto, orgId: string): Promise<Invitation> {
    const invitation = await this.getInvitation(id, orgId);

    if (invitation.status !== 'pending') {
      throw new BadRequestException('Can only resend pending invitations');
    }

    // Extend expiration
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    invitation.expiresAt = expiresAt;

    // Update message if provided
    if (dto.message) {
      invitation.message = dto.message;
    }

    const updated = await this.invitationRepository.save(invitation);

    // TODO: Send email notification
    // await this.sendInvitationEmail(updated);

    return updated;
  }

  /**
   * Accept invitation
   */
  async acceptInvitation(dto: AcceptInvitationDto, userId: string): Promise<Invitation> {
    const invitation = await this.getInvitationByToken(dto.token);

    invitation.status = 'accepted';
    invitation.acceptedBy = userId;
    invitation.acceptedAt = new Date();

    const accepted = await this.invitationRepository.save(invitation);

    // TODO: Add user to organization
    // await this.organizationService.addMember(invitation.orgId, userId, invitation.role, invitation.permissions);

    // TODO: Send welcome email
    // await this.sendWelcomeEmail(userId, invitation.organization);

    return accepted;
  }

  /**
   * Revoke invitation
   */
  async revokeInvitation(id: string, orgId: string): Promise<Invitation> {
    const invitation = await this.getInvitation(id, orgId);

    if (invitation.status !== 'pending') {
      throw new BadRequestException('Can only revoke pending invitations');
    }

    invitation.status = 'revoked';
    return this.invitationRepository.save(invitation);
  }

  /**
   * Delete invitation
   */
  async deleteInvitation(id: string, orgId: string): Promise<void> {
    const invitation = await this.getInvitation(id, orgId);
    await this.invitationRepository.remove(invitation);
  }

  /**
   * Clean up expired invitations (run as cron job)
   */
  async cleanupExpiredInvitations(): Promise<number> {
    const expiredInvitations = await this.invitationRepository
      .createQueryBuilder('invitation')
      .where('invitation.status = :status', { status: 'pending' })
      .andWhere('invitation.expiresAt < :now', { now: new Date() })
      .getMany();

    for (const invitation of expiredInvitations) {
      invitation.status = 'expired';
      await this.invitationRepository.save(invitation);
    }

    return expiredInvitations.length;
  }

  /**
   * Get invitation statistics
   */
  async getInvitationStats(orgId: string): Promise<{
    total: number;
    pending: number;
    accepted: number;
    expired: number;
    revoked: number;
  }> {
    const invitations = await this.getInvitations(orgId);

    return {
      total: invitations.length,
      pending: invitations.filter((i) => i.status === 'pending').length,
      accepted: invitations.filter((i) => i.status === 'accepted').length,
      expired: invitations.filter((i) => i.status === 'expired').length,
      revoked: invitations.filter((i) => i.status === 'revoked').length,
    };
  }

  // TODO: Implement email sending
  // private async sendInvitationEmail(invitation: Invitation): Promise<void> {
  //   const inviteUrl = `${process.env.FRONTEND_URL}/invite/${invitation.token}`;
  //   // Send email with nodemailer
  // }
}
