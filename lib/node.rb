class Node
  def initialize(num, name, type, value)
    @num = num
    @name = name
    @type = type
    @linkcount = 0
    @value = Array.new
    @value.push(value)
  end

  def update(toadd)
    @value.push(toadd)
  end
  
  def getID
    return @num
  end

  def addLink
    @linkcount += 1
  end

  def nodeData
    json_hash = {:id => @name, :type => @type, :linkcount => @linkcount, :data => @value}
  end
end
