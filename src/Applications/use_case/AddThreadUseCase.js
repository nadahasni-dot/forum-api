const AddThread = require('../../Domains/threads/entities/AddThread');

class AddThreadUseCase {
  constructor({ userRepository, threadRepository }) {
    this._userRepository = userRepository;
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload) {
    const addThread = new AddThread(useCasePayload);
    await this._userRepository.getUserById(addThread.userId);
    return await this._threadRepository.addThread(addThread);
  }
}

module.exports = AddThreadUseCase;
