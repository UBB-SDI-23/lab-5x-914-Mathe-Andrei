export function validate_password(password: string) {
	const pattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!&$@#%()*+\-/<=>?_^~])[A-Za-z\d!&$@#%()*+\-/<=>?_^~]{8,}$/;
	return pattern.test(password);
}

export function validate_email(email: string) {
	const pattern = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
	return pattern.test(email);
}

export function validate_url(url: string) {
	 const pattern = /^[Hh][Tt][Tt][Pp][Ss]?:\/\/(?:(?:[a-zA-Z\u00a1-\uffff0-9]+-?)*[a-zA-Z\u00a1-\uffff0-9]+)(?:\.(?:[a-zA-Z\u00a1-\uffff0-9]+-?)*[a-zA-Z\u00a1-\uffff0-9]+)*(?:\.(?:[a-zA-Z\u00a1-\uffff]{2,}))(?::\d{2,5})?(?:\/[^\s]*)?$/;
	return pattern.test(url);
}

export function validate_birthday(birthday: string) {
	return birthday <= new Date().toISOString().split('T')[0];
}