from .ServiceEmail import ServiceEmail
from .ServiceAuth import ServiceAuth
from .ServiceUser import ServiceUser
from .ServiceProjeto import ServiceProjeto
from .ServiceTarefa import ServiceTarefa
from .ServiceConvite import ServiceConvite
from .ServiceAnexo import ServiceAnexo
from src.Repository.RepositoryUser import RepositoryUser
from src.Repository.RepositoryProjeto import RepositoryProjeto
from src.Repository.RepositoryTarefa import RepositoryTarefa
from src.Repository.RepositoryConvite import RepositoryConvite
from src.Repository.RepositoryAnexo import RepositoryAnexo


class Services:
    def __init__(self, database, config, recoverySender=None):
        userRepository = RepositoryUser(database)
        projectRepository = RepositoryProjeto(database)
        taskRepository = RepositoryTarefa(database)
        self.auth = ServiceAuth(userRepository, projectRepository, config, recoverySender or (ServiceEmail(config) if config.smtpHost else None))
        self.projetos = ServiceProjeto(projectRepository, taskRepository)
        self.user = ServiceUser(userRepository, self.projetos)
        self.tarefas = ServiceTarefa(taskRepository, self.projetos)
        self.convites = ServiceConvite(RepositoryConvite(database), self.projetos)
        self.anexos = ServiceAnexo(RepositoryAnexo(database), self.tarefas, config)
