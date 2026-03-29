"""
WORKFLOW ENGINE - THE CORE INNOVATION
This module dynamically generates approval workflows based on configured rules.
"""

from django.db import transaction
from apps.approvals.models import ApprovalFlow, ApprovalStep, Approver
from apps.rules.models import Rule
from apps.audit.models import ApprovalLog
from decimal import Decimal


class WorkflowEngine:
    """Orchestrates dynamic approval workflow generation and execution."""
    
    @staticmethod
    def generate_approval_flow(expense):
        """
        Generate a dynamic approval workflow for an expense.
        This is where the magic happens!
        
        Process:
        1. Evaluate all active rules for the company
        2. Match rules based on expense attributes
        3. Generate approval steps based on matched rules
        4. Assign approvers to each step
        5. Create audit log entry
        
        Returns: ApprovalFlow object
        """
        with transaction.atomic():
            # Create the main approval flow
            flow = ApprovalFlow.objects.create(expense=expense)
            
            # Get all active rules for this company, ordered by priority
            rules = Rule.objects.filter(
                company=expense.company,
                is_active=True
            ).order_by('-priority')
            
            # Evaluate rules and collect matched ones
            matched_rules = []
            for rule in rules:
                if WorkflowEngine._evaluate_rule(rule, expense):
                    matched_rules.append(rule)
            
            # Generate steps from matched rules
            sequence = 1
            for rule in matched_rules:
                step = WorkflowEngine._create_approval_step(
                    flow=flow,
                    rule=rule,
                    sequence=sequence,
                    expense=expense
                )
                if step:
                    sequence += 1
            
            # Log workflow creation
            ApprovalLog.objects.create(
                expense=expense,
                action='WORKFLOW_CREATED',
                performed_by=expense.user,
                metadata={
                    'flow_id': flow.id,
                    'matched_rules': [r.id for r in matched_rules],
                    'total_steps': sequence - 1
                }
            )
            
            return flow
    
    @staticmethod
    def _evaluate_rule(rule, expense):
        """Evaluate if a rule matches the given expense."""
        condition_type = rule.condition_type
        condition_config = rule.condition_config
        
        if condition_type == 'AMOUNT':
            return WorkflowEngine._evaluate_amount_condition(
                condition_config, 
                expense.converted_amount
            )
        
        elif condition_type == 'CATEGORY':
            return WorkflowEngine._evaluate_category_condition(
                condition_config,
                expense.category
            )
        
        elif condition_type == 'ROLE':
            return WorkflowEngine._evaluate_role_condition(
                condition_config,
                expense.user.role
            )
        
        return False
    
    @staticmethod
    def _evaluate_amount_condition(config, amount):
        """Evaluate amount-based condition: {operator: '>', value: 50000}"""
        operator = config.get('operator', '>')
        threshold = Decimal(str(config.get('value', 0)))
        
        if operator == '>':
            return amount > threshold
        elif operator == '>=':
            return amount >= threshold
        elif operator == '<':
            return amount < threshold
        elif operator == '<=':
            return amount <= threshold
        elif operator == '==':
            return amount == threshold
        
        return False
    
    @staticmethod
    def _evaluate_category_condition(config, category):
        """Evaluate category-based condition: {categories: ['travel', 'equipment']}"""
        allowed_categories = config.get('categories', [])
        return category.lower() in [c.lower() for c in allowed_categories]
    
    @staticmethod
    def _evaluate_role_condition(config, role):
        """Evaluate role-based condition: {roles: ['employee']}"""
        allowed_roles = config.get('roles', [])
        return role.lower() in [r.lower() for r in allowed_roles]
    
    @staticmethod
    def _create_approval_step(flow, rule, sequence, expense):
        """Create an approval step based on a matched rule."""
        action_config = rule.action_config
        action_type = action_config.get('action_type')
        
        if action_type == 'AUTO_APPROVE':
            return None
        
        rule_type = action_config.get('rule_type', 'ALL')
        threshold_percentage = action_config.get('threshold_percentage')
        
        step = ApprovalStep.objects.create(
            flow=flow,
            sequence_order=sequence,
            rule_type=rule_type,
            threshold_percentage=threshold_percentage
        )
        
        if action_type == 'ADD_MANAGER':
            WorkflowEngine._assign_manager_approvers(step, expense.user)
        elif action_type == 'ADD_ROLE':
            target_role = action_config.get('target_role')
            WorkflowEngine._assign_role_approvers(step, target_role, expense.company)
        elif action_type == 'ADD_SPECIFIC':
            user_id = action_config.get('user_id')
            WorkflowEngine._assign_specific_approver(step, user_id)
        
        return step
    
    @staticmethod
    def _assign_manager_approvers(step, employee):
        """Assign employee's direct manager(s) as approvers"""
        from apps.users.models import ReportingStructure
        
        managers = ReportingStructure.objects.filter(
            employee=employee,
            effective_to__isnull=True
        ).select_related('manager')
        
        for rel in managers:
            Approver.objects.create(
                step=step,
                user=rel.manager,
                status='PENDING'
            )
    
    @staticmethod
    def _assign_role_approvers(step, role, company):
        """Assign all users with specific role as approvers"""
        from apps.users.models import User
        
        users = User.objects.filter(company=company, role=role)
        
        for user in users:
            Approver.objects.create(
                step=step,
                user=user,
                status='PENDING'
            )
    
    @staticmethod
    def _assign_specific_approver(step, user_id):
        """Assign a specific user as approver"""
        from apps.users.models import User
        
        try:
            user = User.objects.get(id=user_id)
            Approver.objects.create(
                step=step,
                user=user,
                status='PENDING'
            )
        except User.DoesNotExist:
            pass
    
    @staticmethod
    def check_step_completion(step):
        """Check if an approval step is complete."""
        approvers = Approver.objects.filter(step=step)
        total = approvers.count()
        
        if total == 0:
            return False, False
        
        approved_count = approvers.filter(status='APPROVED').count()
        rejected_count = approvers.filter(status='REJECTED').count()
        
        if rejected_count > 0:
            return True, True
        
        if step.rule_type == 'ALL':
            return approved_count == total, False
        elif step.rule_type == 'PERCENTAGE':
            threshold = step.threshold_percentage or 100
            approval_percentage = (approved_count / total) * 100
            return approval_percentage >= threshold, False
        elif step.rule_type == 'SPECIFIC_APPROVER':
            return approved_count > 0, False
        
        return False, False
    
    @staticmethod
    def progress_workflow(expense):
        """Progress the workflow to the next step if current step is complete."""
        flow = ApprovalFlow.objects.filter(expense=expense).first()
        
        if not flow:
            return False, expense.status
        
        steps = ApprovalStep.objects.filter(flow=flow).order_by('sequence_order')
        
        for step in steps:
            is_complete, is_rejected = WorkflowEngine.check_step_completion(step)
            
            if is_rejected:
                expense.status = 'REJECTED'
                expense.save()
                
                ApprovalLog.objects.create(
                    expense=expense,
                    action='EXPENSE_REJECTED',
                    performed_by=None,
                    metadata={'step_id': step.id}
                )
                
                return True, 'REJECTED'
            
            if not is_complete:
                expense.status = 'IN_PROGRESS'
                expense.save()
                return False, 'IN_PROGRESS'
        
        expense.status = 'APPROVED'
        expense.save()
        
        ApprovalLog.objects.create(
            expense=expense,
            action='EXPENSE_APPROVED',
            performed_by=None,
            metadata={'flow_id': flow.id}
        )
        
        return True, 'APPROVED'
