export default interface IUseCase<T> {
    call(): T | Promise<T>
}