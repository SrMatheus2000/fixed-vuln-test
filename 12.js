bind => {
    bindContributionProvider(bind, ConnectionContainerModule);
    bindContributionProvider(bind, MessagingService.Contribution);
    bind(MessagingService.Identifier).to(MessagingContribution).inSingletonScope();
    bind(MessagingContribution).toDynamicValue(({ container }) => {
        const child = container.createChild();
        child.bind(MessagingContainer).toConstantValue(container);
        return child.get(MessagingService.Identifier);
    }).inSingletonScope();
    bind(BackendApplicationContribution).toService(MessagingContribution);
}