function unique_name_641 ($q, $scope, $state, $sanitize, TeamService, UserService, ModalService, Notifications, Authentication) {
  $scope.state = {
    actionInProgress: false
  };

  $scope.formValues = {
    Name: '',
    Leaders: []
  };

  $scope.checkNameValidity = function(form) {
    var valid = true;
    for (var i = 0; i < $scope.teams.length; i++) {
      if ($scope.formValues.Name === $scope.teams[i].Name) {
        valid = false;
        break;
      }
    }
    form.team_name.$setValidity('validName', valid);
  };

  $scope.addTeam = function() {
    var teamName = $sanitize($scope.formValues.Name);
    var leaderIds = [];
    angular.forEach($scope.formValues.Leaders, function(user) {
      leaderIds.push(user.Id);
    });

    $scope.state.actionInProgress = true;
    TeamService.createTeam(teamName, leaderIds)
    .then(function success(data) {
      Notifications.success('Team successfully created', teamName);
      $state.reload();
    })
    .catch(function error(err) {
      Notifications.error('Failure', err, 'Unable to create team');
    })
    .finally(function final() {
      $scope.state.actionInProgress = false;
    });
  };

  $scope.removeAction = function (selectedItems) {
    ModalService.confirmDeletion(
      'Do you want to delete the selected team(s)? Users in the team(s) will not be deleted.',
      function onConfirm(confirmed) {
        if(!confirmed) { return; }
        deleteSelectedTeams(selectedItems);
      }
    );
  };

  function deleteSelectedTeams(selectedItems) {
    var actionCount = selectedItems.length;
    angular.forEach(selectedItems, function (team) {
      TeamService.deleteTeam(team.Id)
      .then(function success() {
        Notifications.success('Team successfully removed', team.Name);
        var index = $scope.teams.indexOf(team);
        $scope.teams.splice(index, 1);
      })
      .catch(function error(err) {
        Notifications.error('Failure', err, 'Unable to remove team');
      })
      .finally(function final() {
        --actionCount;
        if (actionCount === 0) {
          $state.reload();
        }
      });
    });
  }

  function initView() {
    var userDetails = Authentication.getUserDetails();
    var isAdmin = userDetails.role === 1 ? true: false;
    $scope.isAdmin = isAdmin;
    $q.all({
      users: UserService.users(false),
      teams: isAdmin ? TeamService.teams() : UserService.userLeadingTeams(userDetails.ID)
    })
    .then(function success(data) {
      $scope.teams = data.teams;
      $scope.users = data.users;
    })
    .catch(function error(err) {
      $scope.teams = [];
      $scope.users = [];
      Notifications.error('Failure', err, 'Unable to retrieve teams');
    });
  }

  initView();
}