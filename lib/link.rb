class Link
  def initialize(source, target, names, value)
    @source = source
    @target = target
    @names = names
    @value = Array.new
    @value.push(value)
  end

  def update(toadd)
    @value.push(toadd)
  end

  def linkData
    link_array = [:source => @source, :target => @target]
  end
end
