async function unique_name_81 (uid, data) {
		if (uid <= 0 || !data || !data.uid) {
			throw new Error('[[error:invalid-uid]]');
		}
		User.isPasswordValid(data.newPassword);
		const [isAdmin, hasPassword] = await Promise.all([
			User.isAdministrator(uid),
			User.hasPassword(uid),
		]);

		if (meta.config['password:disableEdit'] && !isAdmin) {
			throw new Error('[[error:no-privileges]]');
		}
		let isAdminOrPasswordMatch = false;
		const isSelf = parseInt(uid, 10) === parseInt(data.uid, 10);

		if (!isAdmin && !isSelf) {
			throw new Error('[[user:change_password_error_privileges]]');
		}

		if (
			(isAdmin && !isSelf) || // Admins ok
			(!hasPassword && isSelf)	// Initial password set ok
		) {
			isAdminOrPasswordMatch = true;
		} else {
			isAdminOrPasswordMatch = await User.isPasswordCorrect(data.uid, data.currentPassword, data.ip);
		}

		if (!isAdminOrPasswordMatch) {
			throw new Error('[[user:change_password_error_wrong_current]]');
		}

		const hashedPassword = await User.hashPassword(data.newPassword);
		await Promise.all([
			User.setUserFields(data.uid, {
				password: hashedPassword,
				rss_token: utils.generateUUID(),
			}),
			User.reset.updateExpiry(data.uid),
			User.auth.revokeAllSessions(data.uid),
		]);

		plugins.fireHook('action:password.change', { uid: uid, targetUid: data.uid });
	}