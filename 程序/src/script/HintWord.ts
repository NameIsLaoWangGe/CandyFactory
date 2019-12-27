export default class HintWord extends Laya.Script {
    /**自己*/
    private self: Laya.Sprite;
    /**属性标签*/
    private property: Laya.FontClip;
    /**属性值*/
    private number: Laya.FontClip;

    constructor() { super(); }

    onEnable(): void {
        this.self = this.owner as Laya.Sprite;
        this.self['HintWord'] = this;
        this.self.alpha = 0;
    }

    /**通过传入的参数来，设置属性图片字的格式
     * @param propertyType 属性类型
     * @param numberValue 属性值
     * */
    initProperty(propertyType: string, numberValue: number): void {
        this.property = this.self.getChildByName('property') as Laya.FontClip;
        this.property.value = propertyType;
        this.number = this.self.getChildByName('number') as Laya.FontClip;
        this.number.value = '+' + numberValue;
        // 位置偏移，因为字符长度不一样
        switch (propertyType) {
            case '攻击速度':
                break;
            case '攻击力':
                this.property.x += 50;
                break;
            case '生命':
                this.property.x += 80;
                break;
            case '防御力':
                break;
            default:
                break;
        }
        this.hintWordMove();
    }
    /**飘字动画时间线*/
    hintWordMove(): void {
        let timeLine = new Laya.TimeLine;
        timeLine.addLabel('appear', 0).to(this.self, { y: this.self.y + 100, alpha: 1 }, 200, Laya.Ease.expoIn, 0)
            .addLabel('pause', 0).to(this.self, { y: this.self.y + 50 }, 500, Laya.Ease.expoIn, 0)
            .addLabel('vanish', 0).to(this.self, { y: this.self.y + 50, alpha: 0 }, 200, Laya.Ease.expoIn, 0)
        timeLine.play('appear', false);
        timeLine.on(Laya.Event.COMPLETE, this, function () {
            this.self.removeSelf();
        });
    }

    onDisable(): void {
    }
}