import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Organization } from './entities/organization.entity';
import { User } from '../auth/entities/user.entity';
import { UpdateOrganizationDto } from './dto/organization.dto';

@Injectable()
export class OrganizationService {
  constructor(
    @InjectRepository(Organization)
    private organizationRepository: Repository<Organization>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async getOrganization(user: User): Promise<Organization> {
    const org = await this.organizationRepository.findOne({
      where: { id: user.orgId },
      relations: ['users'],
    });

    if (!org) {
      throw new NotFoundException('Organization not found');
    }

    return org;
  }

  async updateOrganization(updateDto: UpdateOrganizationDto, user: User): Promise<Organization> {
    // Only owner or admin can update
    if (user.role !== 'owner' && user.role !== 'admin') {
      throw new ForbiddenException('Only owners and admins can update organization');
    }

    const org = await this.getOrganization(user);

    if (updateDto.name) {
      org.name = updateDto.name;
    }

    if (updateDto.logo || updateDto.accentColor) {
      org.settings = org.settings || {};
      if (updateDto.logo !== undefined) {
        org.settings.logo = updateDto.logo;
      }
      if (updateDto.accentColor !== undefined) {
        org.settings.accentColor = updateDto.accentColor;
      }
    }

    return this.organizationRepository.save(org);
  }

  async getMembers(user: User): Promise<User[]> {
    const users = await this.userRepository.find({
      where: { orgId: user.orgId },
      select: ['id', 'email', 'name', 'avatar', 'role', 'status', 'createdAt'],
      order: { createdAt: 'ASC' },
    });

    return users;
  }
}
