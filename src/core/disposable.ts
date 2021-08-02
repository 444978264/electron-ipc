interface IDisposable {
  dispose(): void;
}

type IDisposables = IDisposable | (() => void);

function isDisposable(disposable: any): disposable is IDisposable {
  return (
    disposable.add &&
    disposable.dispose &&
    disposable._addParent &&
    disposable._removeParent
  );
}

export class Disposable implements IDisposable {
  private _disposables = new Set<IDisposables>();
  private _disposed = false;
  private _parent: null | Disposable | Disposable[] = null;

  add(disposable?: IDisposables) {
    if (disposable) {
      this._disposables.add(disposable);
      if (disposable instanceof Disposable) {
        disposable._addParent(this);
      }
    }
    return this;
  }

  remove(disposable: IDisposables) {
    this._disposables.delete(disposable);
    if (disposable instanceof Disposable) {
      disposable._removeParent(this);
    }
    return this;
  }

  private _addParent(parent: Disposable): Disposable | Disposable[] {
    return Array.isArray(this._parent)
      ? (this._parent.push(parent), this._parent)
      : this._parent
      ? (this._parent = [this._parent, parent])
      : (this._parent = parent);
  }

  private _removeParent(parent: Disposable) {
    if (Array.isArray(this._parent)) {
      const idx = this._parent.indexOf(parent);
      idx > -1 && this._parent.splice(idx, 1);
    } else {
      this._parent = null;
    }
  }

  dispose() {
    if (!this._disposed) {
      const errors = [];
      this._disposed = true;
      const { _parent } = this;

      if (_parent) {
        this._parent = null;
        if (Array.isArray(_parent)) {
          _parent.forEach(parent => {
            parent.remove(this);
          });
        } else {
          _parent.remove(this);
        }
      }

      this._disposables.forEach(disposable => {
        try {
          if (isDisposable(disposable)) {
            disposable.dispose();
          } else {
            disposable();
          }
        } catch (error) {
          errors.push(error);
        }
      });

      this._disposables.clear();

      if (errors.length) {
        throw Error(`[UnCatchError]=> dispose error(${errors.length} errors)`);
      }
    }
  }
}
