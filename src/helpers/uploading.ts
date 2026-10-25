import {ENDPOINT, MAX_UPLOADING_CHUNK_SIZE} from "./consts.js";

export interface APIResponse<T> {
	data: T
}

export interface BeginFileUploadResponse {
	upload_id: number
}

export interface CompleteFileUploadResponse {
	file_id: number
	file_url: string
	file_upload_url: string
}

export class UploadingRequests {
	private static async sendAny<T>(
		requestType: string,
		endpointSuffix: string,
		getOptions: any | undefined,
		body: any | undefined,
		abortChecker: () => boolean,
		onProgress?: (uploaded: number) => void
	)
		: Promise<APIResponse<T> | undefined>
	{
		return new Promise<any | undefined>((resolve, reject) => {
			try {
				let params = new URLSearchParams();

				if (getOptions)
					for (let key in getOptions)
						if (getOptions[key] !== null && getOptions[key] !== undefined)
							params.append(key, getOptions[key]);

				const xhr = new XMLHttpRequest();
				xhr.open(requestType, `${ENDPOINT}/api/storage/${endpointSuffix}?${params.toString()}`)
				xhr.setRequestHeader( 'Authorization', localStorage.token)

				xhr.upload.onprogress = (e) => {
					if (abortChecker())
						xhr.abort()

					if (!e.lengthComputable)
						return;

					onProgress?.(e.loaded);
				};

				xhr.onload = () => {
					if (xhr.status >= 200 && xhr.status < 300) {
						const text = xhr.responseText

						resolve(
							(
								text.length > 0
								? JSON.parse(text)
								: {}
							) as APIResponse<T>
						);
					}
					else {
						reject(undefined)
					}
				};

				xhr.onerror = () => reject(undefined);

				xhr.send(body);
			}
			catch (e) {
				console.error('Uploading error', e);

				reject(undefined)
			}
		});
	}

	public static async uploadByChunks(
		file: File,
		parentDirectoryID: number | undefined,
		abortChecker: () => boolean,
		onProgress?: (uploaded: number, speed: number) => void
	)
		: Promise<CompleteFileUploadResponse | undefined>
	{
		const totalChunks = Math.ceil(file.size / MAX_UPLOADING_CHUNK_SIZE)
		let bytesSent = 0

		// Begin
		const beginResponse = await this.sendAny<BeginFileUploadResponse>(
			'GET',
			`begin_file_upload`,
			{
				file_name: file.name,
				chunk_count: totalChunks
			},
			undefined,
			abortChecker
		)

		if (!beginResponse)
			return

		const uploadID = beginResponse.data.upload_id

		// Continue
		let speedTime = performance.now()
		let speedUploaded = 0
		let speed = 0

		for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
			const start = chunkIndex * MAX_UPLOADING_CHUNK_SIZE;
			const end = Math.min(start + MAX_UPLOADING_CHUNK_SIZE, file.size);
			const blob = file.slice(start, end);

			const formData = new FormData();
			formData.append('file', file.slice(start, end));

			const uploadContinueJSON = await this.sendAny(
				'POST',
				'continue_file_upload',
				{
					upload_id: uploadID,
					chunk_index: chunkIndex
				},
				formData,
				abortChecker,
				chunkUploaded => {
					const fileUploaded = bytesSent + chunkUploaded

					// Computing speed
					const speedDeltaTimeMs = performance.now() - speedTime
					const newSpeed = (fileUploaded - speedUploaded) * 1000 / speedDeltaTimeMs

					speed = speed
						? speed * 0.9 + newSpeed * 0.1
						: newSpeed

					speedUploaded = fileUploaded
					speedTime = performance.now()

					onProgress?.(fileUploaded, speed)
				}
			)

			if (!uploadContinueJSON)
				return

			bytesSent += blob.size;
		}

		// End
		const completeResponse = await this.sendAny<CompleteFileUploadResponse>(
			'GET',
			'complete_file_upload',
			{
				'upload_id': uploadID,
				'parent_directory_id': parentDirectoryID ? parentDirectoryID : null,
			},
			undefined,
			abortChecker
		)

		if (!completeResponse)
			return undefined

		return completeResponse.data;
	}
}